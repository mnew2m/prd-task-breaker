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
