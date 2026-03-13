# Test Plan

## Backend Tests

### Unit Tests
- `AnalysisServiceTest`: MockAiClient 사용, 정상/실패 케이스
- `AiResponseMapperTest`: JSON → DTO 변환, 누락 필드 graceful degradation
- `AiResponseValidatorTest`: 스키마 검증 로직

### Integration Tests
- `AnalysisControllerTest`: MockMvc, 전체 플로우 검증
- `PrdAnalysisRepositoryTest`: H2로 영속화 검증

### Test Cases
1. 유효한 PRD → 200 + 8개 섹션 응답
2. 빈 입력 → 400 Bad Request
3. 너무 짧은 입력 (< 50자) → 400
4. AI 실패 → 500 + 에러 메시지
5. 존재하지 않는 id 조회 → 404

## Frontend Tests

### Unit Tests (Vitest)
- `useAnalysis.ts`: API 호출, 상태 관리
- `analysisApi.ts`: HTTP 클라이언트 모킹

### Component Tests
- `PrdInput`: 입력 검증, 제출 이벤트
- `AnalysisResult`: 8개 섹션 렌더링

## CI
GitHub Actions: push/PR마다 자동 실행
