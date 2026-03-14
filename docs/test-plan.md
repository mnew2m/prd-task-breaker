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
- `AnalysisControllerTest`: MockMvc, 전체 플로우 검증
- `PrdAnalysisRepositoryTest`: @DataJpaTest H2로 영속화 검증

### Test Cases
1. 유효한 PRD → 200 + 9개 섹션 응답
2. 빈 입력 → 400 Bad Request
3. 너무 짧은 입력 (< 50자) → 400
4. 단어 수 부족 입력 (5개 미만) → 400
5. 반복 문자 입력 (단일 문자 50%+) → 400
6. AI 실패 → 500 + 에러 메시지
7. 존재하지 않는 id 조회 → 404
8. 피드백 useful=true/false → 200, DB 저장 확인
9. 완료되지 않은 분석에 피드백 → 500
10. useful 필드 누락된 피드백 요청 → 400

## Frontend Tests

### Unit Tests (Vitest)
- `useAnalysis.test.ts`: API 호출, 상태 관리, 취소(ERR_CANCELED) 처리, 성공 시 토스트 알림, AxiosError 기반 에러 메시지 추출
- `useToast.test.ts`: show() 토스트 추가, 기본 타입, 커스텀 타입, 중복 스택, 고유 id, duration 후 자동 제거
- `errors.test.ts`: 실제 `AxiosError` 인스턴스 기반 — `isCanceledError` (ERR_CANCELED/기타 코드/plain object/null), `extractApiErrorMessage` (응답 있음/없음/plain object/null)

### Component Tests
- `PrdInput.test.ts`: 버튼 비활성화(빈/짧은 입력/로딩), analyze emit, too-short 클래스, 샘플 로드
- `AnalysisResult.test.ts`: 결과 ID 표시, README 섹션 조건부 렌더링, 8개 섹션 컴포넌트, props 전달, result-notice 면책 문구, 복사 버튼 표시/숨김, clipboard.writeText 호출 검증, FeedbackSection 컴포넌트 렌더링 확인
- `FeedbackSection.test.ts`: 버튼 활성/비활성(prior feedback 여부), 선택 상태 표시, API 호출 및 제출 후 비활성화, 실패 시 에러 토스트
- `Toast.test.ts`: 초기 빈 상태, show() 후 메시지 렌더링, success/error/info 클래스 적용, 다수 토스트 동시 렌더링, aria-live 속성, duration 후 자동 제거
- `PdfExportButton.test.ts`: 모달 열기/닫기, 섹션 필터링, 전체 해제 시 버튼 비활성화, generatePdf 호출, 생성 중 닫기 방지
- `App.test.ts`: scroll-to-top 버튼 표시/숨김/클릭
- `SectionReorderModal.test.ts`: 드래그 순서 변경, 터치 드래그, 취소 시 초기화
- `AnalysisHistory.test.ts`: 히스토리 목록 렌더링, 접기/펼치기, 카드 클릭 emit, 최근 3개 제한
- `ConfirmDialog.test.ts`: 열림/닫힘 렌더링, 확인/취소 emit, ESC 키 닫기, 포커스 트랩
- `LoadingState.test.ts`: analyze/load 모드별 문구 분기

## E2E Tests (Playwright)

`frontend/e2e/smoke.spec.ts` — Chromium, API mock 포함:
1. 페이지 타이틀·헤더 렌더링 확인
2. PRD 텍스트영역 표시 및 입력 동작
3. 50자 미만 입력 시 분석 버튼 비활성화
4. 50자 이상 입력 시 분석 버튼 활성화
5. 샘플 PRD 불러오기 버튼 동작
6. API mock + 분석 플로우 전체: POST 분석 → 결과 화면 전환 확인

실행: `cd frontend && npm run test:e2e`
CI: `frontend-e2e` 잡 (Chromium만), 결과는 `playwright-report/` 아티팩트로 저장

## 성능 테스트 계획

실행 환경: 스테이징 또는 로컬 (백엔드 구동 필요)

| 시나리오 | 도구 | 목표 |
|---------|------|------|
| AI 분석 P95 응답시간 | k6 (`perf/load-test.js`) | 30초 이내 |
| 동시 5명 분석 요청 | k6 VU=5 | 타임아웃·에러 없음 |
| 페이지 초기 로드 (FCP) | Lighthouse CI | 2초 이내 |

## 보안 테스트 항목

| 항목 | 방법 | 자동화 여부 |
|------|------|------------|
| 프론트엔드 의존성 취약점 | `npm audit --audit-level=high` | CI 자동 |
| 백엔드·프론트엔드 의존성 취약점 (CVE) | Trivy (`aquasecurity/trivy-action`) | 주 1회 자동 (CRITICAL/HIGH, 패치 있는 항목만 빌드 실패) |
| 백엔드 의존성 자동 업데이트 | Dependabot PR | 주 1회 자동 |
| 입력 검증 (단어수·반복문자) | `PrdContentValidatorTest` | CI 자동 |
| 프롬프트 인젝션 방어 | system 프롬프트 역할 강화 + `<user_prd>` 태그 격리 | 코드 리뷰 |
| OWASP Top 10 수동 점검 | OWASP ZAP (스테이징) | 릴리즈 전 수동 |

## CI
GitHub Actions (`gradle/actions/setup-gradle@v3`, `gradle-version: 8.13`): push/PR마다 자동 실행
- `backend-test`: `gradle build --no-daemon` (빌드 + 테스트 + Jacoco 리포트)
- `security.yml` (`trivy-scan`): Trivy로 backend/frontend 의존성 취약점 스캔, 매주 월요일 09:00 KST, 수동 실행 가능
- `frontend-check`: `npm ci` → `npm audit --audit-level=high` → `type-check` → `test:coverage` → `build`
- `frontend-e2e`: Playwright Chromium 스모크 테스트 6개
- Dependabot: npm/gradle/github-actions 주 1회(월요일) 자동 의존성 업데이트 PR
- 배포 파이프라인·롤백·모니터링 상세: `docs/deploy.md` 참조
