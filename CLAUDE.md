# CLAUDE.md - PRD Task Breaker

## Project Overview
PRD(Product Requirements Document)를 입력받아 실제 개발 착수가 가능한 구조화된 결과를 생성하는 AI-Native 웹 애플리케이션.

## Architecture
- **Frontend**: Vue 3 + TypeScript + Vite (port 5173)
- **Backend**: Spring Boot 3.2 + Java 17 + Gradle (port 8080)
- **DB**: H2 (dev), PostgreSQL (prod)
- **AI**: MockAiClient (dev profile), ClaudeAiClient (prod profile)

## Key Design Decisions
- AI Adapter pattern: `AiClient` interface → Spring Profile로 mock/실제 전환
- 단일 엔티티 `PrdAnalysis`에 전체 결과 JSON 저장
- 동기 REST API (MVP에서 SSE/비동기 제외)
- Base package: `com.prdbreaker`

## Dev Setup
```bash
# Full stack
docker-compose up

# Backend only
cd backend && ./gradlew bootRun

# Frontend only
cd frontend && npm install && npm run dev
```

## Spring Profiles
- `dev` (default): H2 in-memory, MockAiClient, CORS localhost:5173
- `prod`: PostgreSQL, ClaudeAiClient

## Environment Variables (prod)
- `ANTHROPIC_API_KEY`: Claude API key
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`: PostgreSQL credentials

## API Endpoints
- `POST /api/v1/analysis` - PRD 분석
- `GET /api/v1/analysis/{id}` - 분석 결과 조회
- `GET /api/v1/analysis` - 최근 분석 목록
- `GET /api/v1/health` - 헬스체크

## Testing
```bash
cd backend && ./gradlew test
cd frontend && npm run test
```

## Out of Scope (MVP)
인증/인가, 파일 업로드, 스트리밍, 결과 편집, 다국어, Rate limiting
