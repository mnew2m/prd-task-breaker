# Test Plan

## Backend Tests

### Unit Tests
- `AnalysisServiceTest`: MockAiClient 사용, 정상/실패 케이스
- `AiResponseMapperTest`: JSON → DTO 변환, 누락 필드 graceful degradation
- `AiResponseValidatorTest`: 스키마 검증 로직, 잘못된 JSON 예외

### Integration Tests
- `AnalysisControllerTest`: MockMvc, 전체 플로우 검증
- `PrdAnalysisRepositoryTest`: @DataJpaTest H2로 영속화 검증

### Test Cases
1. 유효한 PRD → 200 + 9개 섹션 응답
2. 빈 입력 → 400 Bad Request
3. 너무 짧은 입력 (< 50자) → 400
4. AI 실패 → 500 + 에러 메시지
5. 존재하지 않는 id 조회 → 404

## Frontend Tests

### Unit Tests (Vitest)
- `useAnalysis.test.ts`: API 호출, 상태 관리

### Component Tests
- `PrdInput.test.ts`: 버튼 비활성화(빈/짧은 입력/로딩), analyze emit, too-short 클래스, 샘플 로드
- `AnalysisResult.test.ts`: 결과 ID 표시, README 섹션 조건부 렌더링, 8개 자식 컴포넌트, props 전달
- `PdfExportButton.test.ts`: 모달 열기/닫기, 섹션 필터링, 전체 해제 시 버튼 비활성화, generatePdf 호출, 생성 중 닫기 방지

## CI
GitHub Actions (`gradle/actions/setup-gradle@v3`, `gradle-version: 8.13`): push/PR마다 자동 실행
- Backend: `gradle build --no-daemon` (빌드 + 테스트 통합)
- Frontend: `npm ci` → `type-check` → `test:coverage` → `build`
