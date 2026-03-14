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

---

## 정상 흐름 시퀀스 다이어그램

```
User                  Frontend (Vue)          Backend                  Claude API
 │                         │                     │                         │
 │── PRD 입력 후 분석 클릭 ──▶│                     │                         │
 │                         │── POST /analysis ──▶│                         │
 │                         │  (prdContent)        │── buildPrompt() ────────▶│
 │                         │  isLoading=true      │                         │
 │                         │  loadingMode=analyze │                         │── AI 처리
 │                         │                     │◀── rawJson ─────────────│
 │                         │                     │── AiResponseMapper      │
 │                         │                     │   .toResponse(rawJson)  │
 │                         │                     │── repository.save()     │
 │                         │◀── 200 PrdAnalysis ─│                         │
 │                         │  result=response     │                         │
 │                         │  isLoading=false     │                         │
 │◀── AnalysisResult 표시 ──│                     │                         │
```

---

## 에러 처리 흐름도

### 케이스 1 — 입력 유효성 오류 (프론트엔드 차단)
```
User ──입력 < 50자──▶ useAnalysis.analyze()
                          │
                          └─▶ error.value = 'PRD 내용을 50자 이상 입력해주세요.'
                               API 호출 없음
                               ErrorState 컴포넌트 표시
```

### 케이스 2 — 사용자 취소 (AbortController)
```
User ──분석 취소 클릭──▶ ConfirmDialog 확인
                            │
                            └─▶ reset() → abortController.abort()
                                 Axios ERR_CANCELED 발생
                                 catch 블록에서 조용히 무시 (error 미설정)
                                 isLoading=false, loadingMode=null
                                 PrdInput 화면으로 복귀
```

### 케이스 3 — 백엔드 입력 검증 실패 (400)
```
Frontend ──POST /analysis──▶ AnalysisController
                                  │
                                  └─▶ @Valid 실패
                                       GlobalExceptionHandler
                                       └─▶ 400 { status, error, message, timestamp }
Frontend
  └─▶ axiosError.response.data.message 추출
       error.value = message
       ErrorState 표시
```

### 케이스 4 — AI 처리 실패 (500)
```
Frontend ──POST /analysis──▶ AnalysisService.analyze()
                                  │
                                  └─▶ ClaudeAiClient 호출 실패
                                       (타임아웃 / API 키 오류 / 응답 파싱 실패)
                                       RuntimeException 발생
                                       GlobalExceptionHandler
                                       └─▶ 500 { status, error, message, timestamp }
Frontend
  └─▶ error.value = 'AI 분석 중 오류가 발생했습니다.'
       ErrorState 표시 (재시도 버튼 포함)
```

### 케이스 5 — 서버 연결 불가
```
Frontend ──POST /analysis──▶ 네트워크 오류 (서버 미기동 등)
                                  │
                                  └─▶ Axios 네트워크 에러 (response 없음)
Frontend
  └─▶ error.value = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
       ErrorState 표시
```

### 케이스 6 — 히스토리 로딩 실패 (GET /analysis/{id})
```
User ──히스토리 카드 클릭──▶ loadById(id)
                                  │
                                  ├─▶ isLoading=true, loadingMode='load'
                                  └─▶ getById() 실패 (404 / 500)
                                       error.value = '분석 결과를 불러올 수 없습니다.'
                                       isLoading=false, loadingMode=null
                                       ErrorState 표시
```

---

## 데이터 흐름 상세도

### 프론트엔드 상태 전환
```
초기 상태
  result=null, isLoading=false, loadingMode=null, error=null
       │
       ├─ analyze() 호출
       │     isLoading=true, loadingMode='analyze'
       │          │ 성공 → result=PrdAnalysisResponse, isLoading=false, loadingMode=null
       │          │ 실패 → error=message,              isLoading=false, loadingMode=null
       │          │ 취소 → (변화 없음),                 isLoading=false, loadingMode=null
       │
       ├─ loadById() 호출
       │     isLoading=true, loadingMode='load'
       │          │ 성공 → result=PrdAnalysisResponse, isLoading=false, loadingMode=null
       │          └─ 실패 → error=message,             isLoading=false, loadingMode=null
       │
       └─ reset() 호출
             result=null, isLoading=false, loadingMode=null, error=null
             (PrdInput 화면으로 복귀)
```

### 백엔드 데이터 변환 파이프라인
```
HTTP Request
  └─▶ { prdContent: string }
        │
        ▼
  AnalysisController (@Valid 검증)
        │
        ▼
  AnalysisService.analyze(prdContent)
        │
        ├─▶ AiClient.analyze(prompt)
        │       prompt = "너는 시니어 개발자다... [prdContent]"
        │       │
        │       ├─ MockAiClient  → 하드코딩된 JSON 문자열 반환 (dev)
        │       └─ ClaudeAiClient → Anthropic API 호출 → rawJson 문자열 반환 (prod)
        │
        ├─▶ AiResponseMapper.toResponse(rawJson)
        │       rawJson(String) → ObjectMapper → AiAnalysisResult(DTO)
        │
        ├─▶ PrdAnalysis 엔티티 생성
        │       { prdContent, resultJson(TEXT), createdAt }
        │
        ├─▶ PrdAnalysisRepository.save(entity)
        │
        └─▶ PrdAnalysisResponse 조립
                entity.id + AiAnalysisResult 필드 → 최종 응답 DTO

HTTP Response
  └─▶ { id, features[], userStories[], todos[], apiDrafts[],
         dbDrafts[], testChecklist[], releaseChecklist[],
         uncertainItems[], readmeDraft, createdAt }
```