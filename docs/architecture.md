# Architecture

## Overview
3-tier architecture with AI Adapter pattern.

```
Frontend (Vue 3 + TS + Vite :5173)
    │ HTTP/REST
Backend (Spring Boot :8080)
    ├── Controller → Service → AI Adapter (interface)
    │                              ├── MockAiClient (dev)
    │                              └── ClaudeAiClient (prod)
    └── Repository → H2 (dev) / PostgreSQL (prod)
```

## Key Design Decisions

### AI Adapter Pattern
`AiClient` interface abstracts AI provider. Spring Profile selects implementation:
- `@Profile("dev")` → `MockAiClient` (returns hardcoded JSON)
- `@Profile("prod")` → `ClaudeAiClient` (calls Anthropic API)

### Data Model
Single entity `PrdAnalysis` stores entire result as JSON (`resultJson TEXT`).
Avoids complex relational mapping for MVP; enables schema evolution without migrations.

### Synchronous REST
MVP uses synchronous POST. Response time target: <30s.
Future: SSE streaming for real-time token display.

## Sequence Diagram
```
User → POST /api/v1/analysis
     → AnalysisController
     → AnalysisService.analyze(prdContent)
     → AiClient.analyze(prompt)
     → (MockAiClient | ClaudeAiClient)
     → AiResponseMapper.toResponse(json)
     → PrdAnalysisRepository.save(entity)
     → return PrdAnalysisResponse
```
