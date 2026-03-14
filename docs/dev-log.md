# Dev Log

## 2026-03-13 - Phase 1: Architecture & Structure
- Defined 3-tier + AI Adapter architecture
- Created full project scaffold (backend + frontend)
- Established domain model: PrdAnalysis entity with resultJson
- API spec: 4 endpoints, error format standardized
- Spring Profile strategy: dev (H2+Mock) / prod (PostgreSQL+Claude)

## 2026-03-13 - Phase 2: Backend Implementation
- Spring Boot project setup with build.gradle
- Entity, Repository, Controller, Service 구현
- MockAiClient (dev), ClaudeAiClient (prod) 구현
- GlobalExceptionHandler, 커스텀 예외 처리
- AiResponseValidator, AiResponseMapper 구현

## 2026-03-13 - Phase 3: Frontend Implementation
- Vue 3 + TypeScript + Vite 프로젝트 구성
- PrdInput, AnalysisResult 등 컴포넌트 구현
- useAnalysis composable, analysisApi 클라이언트
- 로딩/에러/빈 상태 UI

## 2026-03-13 - Phase 4: AI Integration & Schema Validation
- ClaudeAiClient Anthropic API 연동
- PromptTemplate: PRD → 구조화된 JSON 프롬프트
- AiResponseValidator: JSON 스키마 검증

## 2026-03-13 - Phase 5: Documentation
- README, CLAUDE.md, docs/* 작성

## 2026-03-13 - Phase 6: Test & CI
- Backend: JUnit 단위/통합 테스트
- Frontend: Vitest useAnalysis 테스트
- GitHub Actions CI 파이프라인 구성

## 2026-03-13 - Deployment & Fixes
- Vercel (frontend), Railway (backend) 배포
- prod DB ddl-auto: validate → update 변경
- vue-tsc v2 업그레이드 (TypeScript 5 호환)
- AI 모델을 환경변수로 변경 (AI_MODEL, 기본값: claude-haiku-4-5-20251001)
- 프롬프트 최적화 (토큰 초과 방지)
- CI: gradlew → gradle/actions/setup-gradle@v3 전환

## 2026-03-14 - Security & Stability
- 프롬프트 인젝션 기본 방어 추가 (입력값 sanitize)
- 프론트엔드 레이스 컨디션 수정: 중복 요청 방지, AbortController 활용
- 타입 안전성 개선 (API 응답 타입 엄격화)

## 2026-03-14 - Test Coverage & Quality
- 백엔드 테스트 커버리지 확대: 서비스·매퍼·밸리데이터 단위 테스트 추가
- AiResponseMapperTest JSON 이스케이프 버그 수정
- 프론트엔드 코드 품질 개선: 데드코드 제거, CSS 중복 정리

## 2026-03-14 - Features & UX
- 분석 취소 기능 추가: 진행 중 요청 중단 + ConfirmDialog 컴포넌트
- 프론트엔드 접근성 개선: ARIA 속성, 키보드 내비게이션, 포커스 트랩
- 로딩 문구 분기: 분석 중 vs 불러오는 중 메시지 구분
- 섹션 순서 변경 결과가 PDF 내보내기 목록에도 반영
- Flyway baseline-on-migrate 설정으로 기존 DB 마이그레이션 안정화

## 2026-03-14 - Infrastructure & Docs
- CI/CD 개선: 프론트엔드 Docker 환경 추가, 빌드 캐시 최적화
- PRD에 사용자 페르소나 및 성공 지표(KPI) 섹션 추가

## 2026-03-14 - Mobile UX
- 히스토리 카드 모바일 1열 레이아웃 (미디어쿼리)
- 섹션 순서 변경 모달 터치 드래그 지원 (touchstart/touchmove/touchend)
- Scroll-to-top 버튼: 모바일에서 스크롤 300px 초과 시 표시
- App.test.ts 신규 작성, SectionReorderModal 터치 테스트 추가
