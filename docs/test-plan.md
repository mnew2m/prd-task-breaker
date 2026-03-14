# Test Plan

## Backend Tests

### Unit Tests
- `AnalysisServiceTest`: MockAiClient 사용, 정상/실패 케이스
- `AiResponseMapperTest`: JSON → DTO 변환, 누락 필드 graceful degradation
- `AiResponseValidatorTest`: 스키마 검증 로직, 잘못된 JSON 예외
- `PrdContentValidatorTest`: 최소 단어 수 미달, 단일 문자 반복(영문/한글), 정상 입력 통과

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

## Frontend Tests

### Unit Tests (Vitest)
- `useAnalysis.test.ts`: API 호출, 상태 관리, 취소(ERR_CANCELED) 처리, 성공 시 토스트 알림
- `useToast.test.ts`: show() 토스트 추가, 기본 타입, 커스텀 타입, 중복 스택, 고유 id, duration 후 자동 제거
- `errors.test.ts`: `isCanceledError` (ERR_CANCELED/기타 코드/null/비객체), `extractApiErrorMessage` (응답 있음/없음/null)

### Component Tests
- `PrdInput.test.ts`: 버튼 비활성화(빈/짧은 입력/로딩), analyze emit, too-short 클래스, 샘플 로드
- `AnalysisResult.test.ts`: 결과 ID 표시, README 섹션 조건부 렌더링, 8개 자식 컴포넌트, props 전달, result-notice 면책 문구, 복사 버튼 표시/숨김, clipboard.writeText 호출 검증
- `Toast.test.ts`: 초기 빈 상태, show() 후 메시지 렌더링, success/error/info 클래스 적용, 다수 토스트 동시 렌더링, aria-live 속성, duration 후 자동 제거
- `PdfExportButton.test.ts`: 모달 열기/닫기, 섹션 필터링, 전체 해제 시 버튼 비활성화, generatePdf 호출, 생성 중 닫기 방지
- `App.test.ts`: scroll-to-top 버튼 표시/숨김/클릭
- `SectionReorderModal.test.ts`: 드래그 순서 변경, 터치 드래그, 취소 시 초기화

## CI
GitHub Actions (`gradle/actions/setup-gradle@v3`, `gradle-version: 8.13`): push/PR마다 자동 실행
- Backend: `gradle build --no-daemon` (빌드 + 테스트 통합)
- Frontend: `npm ci` → `npm audit --audit-level=high` → `type-check` → `test:coverage` → `build`
- Dependabot: npm/gradle/github-actions 주 1회(월요일) 자동 의존성 업데이트 PR
