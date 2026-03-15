# Test Plan

## Backend Tests

### Unit Tests

- `AnalysisServiceTest`: MockAiClient 사용, 정상/실패 케이스
- `AiResponseMapperTest`: JSON → DTO 변환, 누락 필드 graceful degradation
- `AiResponseValidatorTest`: 스키마 검증 로직, 잘못된 JSON 예외
- `PrdContentValidatorTest`: 최소 단어 수 미달, 단일 문자 반복(영문/한글), 정상 입력 통과

### CORS Tests

- `AnalysisControllerTest`: `corsPreflightPatch_returnsAllowed()` — PATCH preflight OPTIONS 요청 시 `Access-Control-Allow-Methods`에 PATCH 포함 검증

### Integration Tests

슬라이스 테스트 (@WebMvcTest / @DataJpaTest):

- `AnalysisControllerTest` (@WebMvcTest, 22개): MockMvc + Mockito, 전체 컨트롤러 플로우 검증
- `PrdAnalysisRepositoryTest` (@DataJpaTest, 9개): H2 인메모리 DB로 영속화 검증

풀 통합 테스트 (@SpringBootTest):

- `AnalysisIntegrationTest` (@SpringBootTest + @AutoConfigureMockMvc, 6개): dev 프로필(MockAiClient + H2) 기반 full-stack 통합 테스트
  - `fullFlow_postAnalysis_getById_getRecent`: POST → GET by ID → GET recent 전체 흐름
  - `fullFlow_submitFeedback_updatesUseful`: POST 분석 → PATCH feedback → GET 결과 검증
  - `postAnalysis_shortContent_returns400`: 짧은 입력 400 검증
  - `getRecent_invalidLimit_returns400`: 잘못된 limit 파라미터 400 검증
  - `getById_nonExistentId_returns404`: 존재하지 않는 ID 404 검증
  - `health_returns200`: 헬스체크 엔드포인트 200 검증

백엔드 전체: **9개 파일, 82개 테스트 메서드** (단위 56개 + 슬라이스 31개 + 통합 6개 — 일부 중복 포함)

### Test Cases

1. 유효한 PRD → 200 + 9개 섹션 응답
2. 빈 입력 → 400 Bad Request
3. 너무 짧은 입력 (< 50자, 단어 1개) → 400
4. 단어 수 부족 입력 (정확히 4개 단어) → 400
5. 반복 문자 입력 (단일 문자 50%+) → 400
6. 반복 문자 정확히 50% 경계값 → 400
7. AI 실패 → 500 + 에러 메시지, DB에 FAILED 상태 저장
8. 존재하지 않는 id 조회 → 404
9. PENDING/FAILED 상태 id 조회 → 500
10. 피드백 useful=true/false → 200, DB 저장 확인
11. 완료되지 않은 분석(PENDING/FAILED)에 피드백 → 500
12. useful 필드 누락된 피드백 요청 → 400
13. `createdAt` ISO 문자열 직렬화 확인 (배열 형식 아님)
14. `limit` 파라미터 범위 검증 (0, -1, 200 → 400)
15. AiResponseMapper 엔티티 메타데이터(id, createdAt, useful) 매핑 정확성
16. CORS preflight PATCH 요청 → Access-Control-Allow-Methods에 PATCH 포함

## Frontend Tests

### Unit Tests (Vitest)

- `useAnalysis.test.ts`: API 호출, 상태 관리, 취소(ERR_CANCELED) 처리, 성공 시 토스트 알림, AxiosError 기반 에러 메시지 추출, 연속 analyze() 시 이전 AbortSignal abort 검증, loadRecent() 실패 시 기존 recentList 보존
- `useToast.test.ts`: show() 토스트 추가, 기본 타입, 커스텀 타입, 중복 스택, 고유 id, duration 후 자동 제거
- `errors.test.ts`: 실제 `AxiosError` 인스턴스 기반 — `isCanceledError` (ERR_CANCELED/기타 코드/plain object/null), `extractApiErrorMessage` (응답 있음/없음/plain object/null), `classifyError()` HTTP 상태별 분류 (non-AxiosError/네트워크 오류/400+message/400 no message/404/408/500+message/500 no message/기타 status)
- `priority.test.ts`: `priorityClass` 유틸 — HIGH/MEDIUM/LOW/unknown 4케이스
- `sections.test.ts`: `DEFAULT_SECTION_ORDER` 길이·중복 없음, `SECTION_LABELS` 완전성 검증

### Component Tests

- `PrdInput.test.ts`: 버튼 비활성화(빈/짧은 입력/로딩), analyze emit, too-short 클래스, 샘플 로드
- `AnalysisResult.test.ts`: 결과 ID 표시, README 섹션 조건부 렌더링, 8개 섹션 컴포넌트, props 전달, result-notice 면책 문구, 복사 버튼 표시/숨김, clipboard.writeText 호출 검증, README 복사 성공/실패 토스트, 전체 빈 섹션 렌더링, FeedbackSection 컴포넌트 렌더링 확인, 기본 섹션 접기 상태(features/userStories/todos 펼침, 나머지 접힘), 섹션 타이틀 클릭 시 접기/펼치기 토글
- `FeedbackSection.test.ts`: 버튼 활성/비활성(prior feedback 여부), 선택 상태 표시, API 호출 및 제출 후 비활성화, 실패 시 에러 토스트, 제출 성공 시 `feedback-submitted(useful: boolean)` emit 및 payload 검증, 연속 클릭 방지(isFeedbackSubmitting), 성공 토스트 메시지 정확성
- `Toast.test.ts`: 초기 빈 상태, show() 후 메시지 렌더링, success/error/info 클래스 적용, 다수 토스트 동시 렌더링, aria-live 속성, duration 후 자동 제거
- `PdfExportButton.test.ts`: 모달 열기/닫기(닫기·취소·오버레이), 섹션 필터링, 전체 해제 시 버튼 비활성화, generatePdf 호출, 생성 중 닫기 방지(닫기·취소·오버레이 모두 차단)
- `App.test.ts`: 마운트 시 result 없이 입력 화면 표시(AnalysisResult 미렌더링), scroll-to-top 버튼 표시/숨김/클릭, `feedback-submitted` 수신 시 `result.value.useful` in-place 업데이트 및 `loadRecent()` 호출 검증
- `SectionReorderModal.test.ts`: 드래그 순서 변경, 터치 드래그, 취소 시 초기화
- `AnalysisHistory.test.ts`: 히스토리 목록 렌더링, 접기/펼치기, 카드 클릭 emit, 최근 3개 제한, `useful=true/false` 피드백 아이콘 표시, `useful=null/undefined` 아이콘 숨김, Enter/Space 키보드 네비게이션
- `ConfirmDialog.test.ts`: 열림/닫힘 렌더링, 확인/취소 emit, ESC 키 닫기, 포커스 트랩
- `LoadingState.test.ts`: 로딩 메시지 렌더링, role/aria-live 속성, 취소 버튼 렌더링, 취소→확인 다이얼로그 표시/숨김, 확인 시 cancel emit, load 모드 메시지 분기, load 모드 힌트/취소 버튼 숨김
- `ErrorState.test.ts`: 에러 메시지 렌더링(role="alert"), hint 조건부 표시, retry emit

### Display Component Tests

- `FeatureList.test.ts`: 빈 상태, 기능명·설명·priority badge·notes 렌더링, 항목 수 표시, `collapsed: true` 시 section-collapsed 클래스 적용, section-title 클릭 시 toggle-collapse emit
- `UserStories.test.ts`: 빈 상태, role·action·benefit 렌더링, 인수 기준 조건부 표시, notes 렌더링, `collapsed: true` 시 section-collapsed 클래스 적용, section-title 클릭 시 toggle-collapse emit
- `TodoBreakdown.test.ts`: 빈 상태, task·category·priority badge 렌더링, estimatedEffort 조건부 표시, notes 렌더링, `collapsed: true` 시 section-collapsed 클래스 적용, section-title 클릭 시 toggle-collapse emit
- `ApiDraft.test.ts`: 빈 상태, method·path 렌더링, HTTP 메서드별 CSS 클래스, requestBody/responseBody 조건부 표시, `collapsed: true` 시 section-collapsed 클래스 적용, section-title 클릭 시 toggle-collapse emit
- `DbDraft.test.ts`: 빈 상태, 테이블명·컬럼 목록 렌더링, notes 조건부 표시, `collapsed: true` 시 section-collapsed 클래스 적용, section-title 클릭 시 toggle-collapse emit
- `TestChecklist.test.ts`: 빈 상태, 항목명·카테고리 렌더링, uncertain 마커 조건부 표시, 항목 수 표시, `collapsed: true` 시 section-collapsed 클래스 적용, section-title 클릭 시 toggle-collapse emit
- `ReleaseChecklist.test.ts`: 빈 상태, 항목명·카테고리 렌더링, 항목 수 표시, `collapsed: true` 시 section-collapsed 클래스 적용, section-title 클릭 시 toggle-collapse emit
- `UncertainItems.test.ts`: 빈 상태, 항목 텍스트 렌더링, 항목 수 표시, li 요소 개수 검증, `collapsed: true` 시 section-collapsed 클래스 적용, section-title 클릭 시 toggle-collapse emit

## E2E Tests (Playwright)

실행: `cd frontend && npm run test:e2e`
CI: `frontend-e2e` 잡 (Chromium만), 결과는 `playwright-report/` 아티팩트로 저장

### `smoke.spec.ts` — 기본 렌더링 및 입력 검증 (6개)

1. 페이지 타이틀·헤더 렌더링 확인
2. PRD 텍스트영역 표시 및 입력 동작
3. 50자 미만 입력 시 분석 버튼 비활성화
4. 50자 이상 입력 시 분석 버튼 활성화
5. 샘플 PRD 불러오기 버튼 동작
6. API mock + 분석 플로우 전체: POST 분석 → 결과 화면 전환 확인

### `user-flows.spec.ts` — 복합 사용자 시나리오 (7개)

1. **에러 처리**: API 500 응답 시 에러 메시지 표시 및 입력 화면 유지 확인
2. **분석 취소**: 로딩 중 취소 버튼 → ConfirmDialog → 확인 → 입력 화면 복귀 확인
3. **히스토리 불러오기**: 분석 완료 → 새 분석 → 히스토리 카드 클릭 → 이전 결과 로딩 확인
4. **피드백 제출**: 결과 화면에서 👍 클릭 → PATCH mock → 저장 완료 토스트 확인
5. **PDF 내보내기**: 결과 화면에서 PDF 저장 클릭 → 모달 열림·섹션 표시 확인 → 취소로 닫힘
6. **섹션 순서 변경**: 순서변경 클릭 → 모달 열림 → 적용 → 모달 닫힘·결과 화면 유지 확인
7. **README 복사**: readmeDraft가 있는 결과에서 복사 클릭 → 클립보드 권한 부여 → 성공 토스트 확인

### `integration.spec.ts` — 실제 백엔드 연동 (4개)

실행 전제: 백엔드가 `http://localhost:8080`에서 동작 중이어야 한다 (CI: `e2e-integration` 잡).

1. **헬스체크**: `GET /api/v1/health` → 200
2. **분석 플로우**: PRD 입력 → 분석 → AnalysisResult 표시 (MockAiClient 응답 검증)
3. **히스토리**: 분석 완료 → 새 분석 클릭 → 입력 화면 복귀 → 히스토리 토글 열기 → 카드 표시 확인
4. **피드백**: 유용함 버튼 클릭 → Toast(`role="status"`) 성공 메시지 확인

> E2E 테스트 총합: smoke 6개 + user-flows 7개 + integration 4개 = **17개**

## 성능 테스트

### CI 자동 검증 (main push)

`ci.yml`의 `performance` 잡이 main 브랜치 push마다 자동 실행. 백엔드 기동 → k6 실행 → threshold 실패 시 빌드 실패. `k6-summary.json` 아티팩트로 결과 보존.

### 수동 실행

스크립트: `perf/load-test.js`

```bash
# k6 설치 (macOS)
brew install k6

# 실행 (백엔드가 localhost:8080에서 동작 중이어야 함)
k6 run perf/load-test.js

# 다른 서버 대상 (GitHub Actions performance.yml 수동 트리거도 가능)
k6 run -e BASE_URL=https://staging.example.com perf/load-test.js
```


| 시나리오            | 도구                       | 설정          | 목표         |
| --------------- | ------------------------ | ----------- | ---------- |
| AI 분석 P95 응답시간  | k6 (`perf/load-test.js`) | VU=1, 3회 반복 | 30초 이내     |
| 동시 5명 분석 요청     | k6 (`perf/load-test.js`) | VU=5, 각 1회  | 타임아웃·에러 없음 |
| 페이지 초기 로드 (FCP) | Lighthouse CI            | —           | 2초 이내      |


thresholds: `analysis_duration p(95)<30000`, `error_rate==0`, `http_req_failed==0`

## 보안 테스트 항목


| 항목                      | 방법                                     | 자동화 여부                                   |
| ----------------------- | -------------------------------------- | ---------------------------------------- |
| 프론트엔드 의존성 취약점           | `npm audit --audit-level=high`         | CI 자동                                    |
| 백엔드·프론트엔드 의존성 취약점 (CVE) | Trivy (`aquasecurity/trivy-action`)    | 주 1회 자동 (CRITICAL/HIGH, 패치 있는 항목만 빌드 실패) |
| 백엔드 의존성 자동 업데이트         | Dependabot PR                          | 주 1회 자동                                  |
| 입력 검증 (단어수·반복문자)        | `PrdContentValidatorTest`              | CI 자동                                    |
| 프롬프트 인젝션 방어             | system 프롬프트 역할 강화 + `<user_prd>` 태그 격리 | 코드 리뷰                                    |
| OWASP Top 10 수동 점검      | OWASP ZAP (스테이징)                       | 릴리즈 전 수동                                 |


## 커버리지

### 프론트엔드 (Vitest + v8)

임계값 설정: `vite.config.ts` → `coverage.thresholds`


| 지표         | 임계값 | 실제 (2026-03-15) |
| ---------- | --- | --------------- |
| Lines      | 70% | **97.42%**      |
| Statements | —   | **97.42%**      |
| Branches   | 85% | **94.19%**      |
| Functions  | 65% | **82.60%**      |


측정 제외 파일:

- `src/main.ts` — 앱 진입점, 환경 초기화
- `src/api/analysisApi.ts` — 모든 테스트에서 mock 처리, 직접 호출되지 않음
- `src/composables/usePdfExport.ts` — jsPDF DOM 의존, jsdom에서 단위 테스트 불가

주요 미커버 라인:

- `App.vue:78` — `window.scrollTo` 호출 경로 (spy 대상이지만 branch 미포함)
- `ConfirmDialog.vue:56-78` — 포커스 트랩 내 `querySelectorAll` 분기 (jsdom 한계)
- `SectionReorderModal.vue:100-103,133-152` — 터치 이벤트 복합 경로

### 백엔드 (Jacoco)

CI `backend-test` 잡에서 `gradle build --no-daemon` 실행 시 Jacoco 리포트(`build/reports/jacoco/`)가 생성되며, `backend-test-report` 아티팩트(`build/reports/tests/test/`)로도 저장된다.

`build.gradle`에 `jacocoTestCoverageVerification` 구성 완료. 미달 시 빌드 실패.

로컬 리포트 확인: `backend/build/reports/jacoco/test/html/index.html`


| 지표           | 임계값 | 실제 (2026-03-15) |
| ------------ | --- | --------------- |
| Lines        | 70% | **95.41%**      |
| Branches     | 60% | **89.02%**      |
| Instructions | —   | **91.29%**      |
| Methods      | —   | **89.29%**      |
| Classes      | —   | **100.00%**     |


## 테스트 갭 및 한계

### 백엔드 통합 테스트 결과 리포트

`AnalysisControllerTest`(MockMvc)와 `PrdAnalysisRepositoryTest`(@DataJpaTest)는 CI에서 자동 실행되며, `backend-test-report` 아티팩트(`build/reports/tests/test/`)로 저장된다.

### E2E 통합 테스트 (실제 백엔드 연동)

`smoke.spec.ts`(6개)와 `user-flows.spec.ts`(7개)는 Playwright `route()` mock 기반이다. 실제 Spring Boot + H2 스택과의 통합은 `e2e-integration` 잡의 `integration.spec.ts`(4개)에서 검증한다.

`**integration.spec.ts` 검증 항목:**

- `GET /api/v1/health` → 200
- PRD 입력 → MockAiClient → H2 저장 → JSON 응답 → 결과 화면 전환
- 분석 완료 후 히스토리 패널 자동 갱신
- 피드백 PATCH 후 성공 토스트

`e2e-integration` 잡은 `main` 브랜치 push 또는 `workflow_dispatch` 시에만 실행 (PR마다 실행 시 비용·시간 과다).

### E2E 잔여 리스크

`integration.spec.ts`는 **dev 프로필(MockAiClient + H2)** 기반으로 실행된다. 이로 인해 다음 경로는 E2E 레벨에서 미검증 상태다:

- **실제 Claude API 응답 파싱**: `ClaudeAiClient` + 실제 API 키 경로는 E2E에서 호출되지 않음
  - 단, `AiResponseMapperTest`(6개)·`AiResponseValidatorTest`(5개) 단위 테스트가 AI 응답 파싱/스키마 검증 경로를 부분 커버
- **PostgreSQL 특성**: 실제 DB 타입 매핑·마이그레이션 동작은 H2에서 검증되지 않음

prod 프로필 E2E(ClaudeAiClient + PostgreSQL)는 API 키·외부 의존성으로 인해 **MVP 범위 외**로 명시적으로 제외.

## CI

GitHub Actions (`gradle/actions/setup-gradle@v3`, `gradle-version: 8.13`): push/PR마다 자동 실행

- `backend-test`: `gradle build --no-daemon` (빌드 + 테스트 + Jacoco 리포트 + 커버리지 임계값 검증); `backend-coverage`·`backend-test-report` 아티팩트 저장
- `security.yml` (`trivy-scan`): Trivy로 backend/frontend 의존성 취약점 스캔, 매주 월요일 09:00 KST, 수동 실행 가능
- `frontend-check`: `npm ci` → `npm audit --omit=dev --audit-level=high` → `type-check` → `test:coverage` → `build`
- `frontend-e2e`: Playwright Chromium — smoke 6개 + user-flows 7개
- `e2e-integration`: main push 또는 workflow_dispatch 시 실행 — 실제 백엔드 기동 후 `integration.spec.ts` 4개 실행; `e2e-integration-report` 아티팩트 저장
- `performance`: main push 시 실행 — 실제 백엔드 기동 후 k6 부하 테스트 (P95 < 30s threshold 실패 시 빌드 실패); `k6-results` 아티팩트 저장
- Dependabot: npm/gradle/github-actions 주 1회(월요일) 자동 의존성 업데이트 PR
- 배포 파이프라인·롤백·모니터링 상세: `docs/deploy.md` 참조

