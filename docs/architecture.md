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

## 프론트엔드 아키텍처

### 컴포넌트 계층 구조

```
App.vue  (루트 — 전역 상태 소유, 화면 전환 조건부 렌더링)
  ├── useAnalysis()          ← 핵심 composable: 모든 분석 관련 상태·액션
  ├── useToast()             ← 토스트 알림 싱글턴 상태
  │
  ├── PrdInput.vue           ← PRD 텍스트 입력, 유효성 표시, 샘플 로드
  ├── LoadingState.vue       ← 로딩 스피너 + 모드별 문구 (analyze / load)
  ├── ErrorState.vue         ← 에러 메시지 + 재시도 버튼
  ├── AnalysisResult.vue     ← 분석 결과 9개 섹션 렌더링
  │     ├── FeatureList.vue
  │     ├── UserStoryList.vue
  │     ├── TodoList.vue
  │     ├── ApiDraftList.vue
  │     ├── DbDraftList.vue
  │     ├── ChecklistSection.vue  (테스트·릴리즈 공용)
  │     ├── UncertainItems.vue
  │     ├── ReadmeDraft.vue       (클립보드 복사 버튼 포함)
  │     ├── FeedbackSection.vue   (👍/👎, 제출 후 비활성화)
  │     └── PdfExportButton.vue
  │           └── SectionReorderModal.vue  ← 드래그&드롭(PC) / 터치(모바일)
  ├── HistoryPanel.vue       ← 최근 분석 목록, 접기/펼치기
  ├── ConfirmDialog.vue      ← 취소 확인 모달 (포커스 트랩)
  ├── Toast.vue              ← 토스트 알림 렌더러 (TransitionGroup)
  └── ScrollToTop.vue        ← 모바일 전용 스크롤 상단 버튼
```

### useAnalysis Composable

`useAnalysis`는 분석 관련 전체 상태와 액션을 캡슐화하는 핵심 composable이다. `App.vue`에서 단 한 번 호출되며 자식 컴포넌트에는 props/emit으로 필요한 값만 전달한다.

```
상태 (ref)
  result      : PrdAnalysisResponse | null  — 현재 표시 중인 분석 결과
  isLoading   : boolean                     — 로딩 중 여부
  loadingMode : 'analyze' | 'load' | null   — 로딩 문구 분기용
  error       : string | null               — 에러 메시지
  history     : PrdAnalysisResponse[]       — 최근 분석 목록

액션
  analyze(prdContent)   — POST /api/v1/analysis, AbortController로 중복 요청 취소
  loadById(id)          — GET /api/v1/analysis/{id}
  loadHistory()         — GET /api/v1/analysis
  submitFeedback(id, useful) — PATCH /api/v1/analysis/{id}/feedback
  reset()               — 전체 상태 초기화, PrdInput 화면으로 복귀
```

### 레이어 구조

```
App.vue / 컴포넌트
    │  호출
    ▼
useAnalysis (composable)
    │  호출
    ▼
analysisApi (api/analysis.ts)   ← Axios 인스턴스 + API 엔드포인트 함수
    │  HTTP
    ▼
Backend REST API (:8080)
```

`analysisApi`는 Axios 인스턴스를 래핑한 순수 함수 모음이며 상태를 갖지 않는다. 상태는 모두 `useAnalysis` composable이 소유한다. 이 분리 덕분에 `useAnalysis`를 단위 테스트할 때 `analysisApi`만 mocking하면 된다.

### 레이스 컨디션 방지

```
analyze() 호출
  │
  ├─ 기존 요청이 진행 중이면 → abortController.abort() 호출
  │       ↳ Axios ERR_CANCELED 발생 → isCanceledError()로 감지 후 조용히 무시
  │
  └─ 새 AbortController 생성 → 새 요청 시작
```

분석 버튼을 빠르게 여러 번 클릭해도 가장 마지막 요청의 결과만 화면에 반영된다.

---

## Key Design Decisions

### AI Adapter Pattern
`AiClient` interface abstracts AI provider. Spring Profile selects implementation:
- `@Profile("dev")` → `MockAiClient` (returns hardcoded JSON)
- `@Profile("prod")` → `ClaudeAiClient` (calls Anthropic API)

### Data Model
Single entity `PrdAnalysis` stores entire result as JSON (`resultJson TEXT`).
Avoids complex relational mapping for MVP; AI response schema can evolve without table-level migrations.

Schema is managed by **Flyway** (`db/migration/`):
- `V1__init.sql` — initial `prd_analysis` table
- `V2__add_useful_column.sql` — feedback column added when the feature was introduced

dev 환경은 H2 인메모리 + `flyway.enabled: false`, prod 환경은 PostgreSQL + Flyway 활성화 + `ddl-auto: validate`.
Flyway는 피드백 기능 추가(V2)가 첫 번째 실질적 스키마 변경이 되는 시점에 도입했다. 초기에는 단일 엔티티 하나로 `ddl-auto: update`로 충분했으나, 스키마 변경이 코드 이력 밖에서 수동 실행되는 패턴을 방지하기 위해 이 시점에 명시적 관리로 전환했다.

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

---

## 도메인 상태 머신 — AnalysisStatus

`PrdAnalysis` 엔티티는 분석 진행 상태를 추적한다.

```
[PENDING]
    │
    ├─ AI 처리 성공 ──▶ [COMPLETED]  (resultJson 저장, completedAt 기록)
    │
    └─ AI 처리 실패 ──▶ [FAILED]     (resultJson=null, completedAt 기록)
```

상태 전이는 엔티티 메서드로 캡슐화되어 있다:
- `entity.complete(resultJson)` — status=COMPLETED, completedAt=now()
- `entity.fail()` — status=FAILED, completedAt=now()

`getById()`, `getRecent()`는 COMPLETED 상태만 반환하므로 PENDING/FAILED 레코드는 히스토리에 노출되지 않는다.

### @Transactional 의도적 생략 (AnalysisService.analyze)

```
repository.save(PENDING)  ← 트랜잭션 1: 즉시 커밋
      │
      ├─ 성공 → entity.complete() → repository.save(COMPLETED)  ← 트랜잭션 2
      │
      └─ 실패 → entity.fail()    → repository.save(FAILED)      ← 트랜잭션 3
                                    → AiProcessingException 전파
```

`analyze()` 메서드에 `@Transactional`을 붙이면 세 번의 save가 하나의 트랜잭션에 묶인다. 이 경우 AI 처리 실패 시 FAILED 상태 저장도 롤백되어 PENDING 레코드만 남게 된다. 트랜잭션을 의도적으로 분리해 **실패 이력이 DB에 남도록** 설계했다.

---

## MVP 설계 트레이드오프 및 확장 방향

현재 구조는 MVP 범위에 최적화되어 있다. 이 섹션은 의도적으로 단순화한 결정들과, 요구사항이 증가할 경우의 전환 방향을 기록한다.

### 동기 REST → 비동기 처리

| | 현재 (MVP) | 확장 시 |
|---|---|---|
| 방식 | 동기 POST, 최대 60s 대기 | 비동기: 요청 즉시 202 반환 + 폴링 또는 SSE |
| 트리거 | 응답 시간 P95 > 30s 빈번 시, 또는 동시 요청 증가 시 |
| 변경 범위 | `AnalysisService` → `@Async` + `CompletableFuture`, 프론트엔드 폴링 로직 추가 |

PENDING 상태가 이미 DB에 저장되므로 비동기 전환 시 클라이언트가 `GET /analysis/{id}`로 완료 여부를 폴링하는 구조로 자연스럽게 연결된다.

### resultJson TEXT → 정규화 테이블

| | 현재 (MVP) | 확장 시 |
|---|---|---|
| 방식 | 전체 결과를 JSON 문자열 1개 컬럼에 저장 | 섹션별 테이블 분리 (`features`, `todos` 등) |
| 트리거 | 섹션 단위 검색·필터링, 결과 편집 기능 추가 시 |
| 변경 범위 | 엔티티 분리, Flyway 마이그레이션, `AiResponseMapper` 재작성 |

### 단일 사용자 → 멀티사용자 (인증/인가)

현재 인증이 없어 모든 분석 결과가 공유된다. 사용자별 히스토리 분리가 필요해지면:
- `PrdAnalysis`에 `userId` 컬럼 추가
- Spring Security + JWT 또는 OAuth2 도입
- `getRecent()` 쿼리에 userId 필터 추가

### AI 제공자 교체

`AiClient` 인터페이스 덕분에 Claude 외 다른 모델(OpenAI, Gemini 등)로 교체 시 새 구현체 클래스 하나와 Spring Profile 설정 변경만으로 전환 가능하다. 기존 코드 수정 없음.

---

## AI 모델 선택 근거 및 토큰 예산

### 모델 선택: claude-haiku-4-5-20251001

| 항목 | 근거 |
|------|------|
| 비용 | Sonnet·Opus 대비 입력 토큰 비용 약 1/10 수준. 1회 분석당 예상 비용 < $0.01 |
| 응답 속도 | Haiku는 Sonnet 대비 약 2~3배 빠름. P95 30초 목표 달성에 유리 |
| 출력 품질 | 9개 섹션 구조화 JSON 생성은 복잡한 추론보다 포맷 준수가 핵심 → Haiku로 충분 |
| 컨텍스트 한도 | 입력 200K 토큰 — PRD 최대 입력(50,000자)을 여유 있게 수용 |
| 출력 한도 | 최대 8,192 토큰 (`max_tokens` 설정값) — 9개 섹션 JSON 응답에 충분 |

모델명은 `AI_MODEL` 환경변수로 외부화되어 있어, 품질 요구가 높아지면 코드 변경 없이 Sonnet으로 교체 가능하다.

### 토큰 예산 계산

```
입력 토큰 추산 (최악 케이스)
  PromptTemplate 고정 부분  :  ~300 토큰
  PRD 입력 최대 50,000자    : ~12,500 토큰  (영문 기준 1토큰 ≈ 4자, 한글 ≈ 2자)
  ─────────────────────────────────────────
  입력 합계                 : ~12,800 토큰  → 200K 한도의 6.4%

출력 토큰 추산 (9개 섹션 JSON)
  features 5개 + userStories 5개 + todos 10개  : ~600 토큰
  apiDrafts 8개 + dbDrafts 5개                : ~400 토큰
  checklist×2 + uncertainItems + readmeDraft  : ~400 토큰
  JSON 구조 오버헤드                           : ~200 토큰
  ─────────────────────────────────────────
  출력 합계                 : ~1,600 토큰  → max_tokens 8,192의 20%
```

초기 프롬프트는 스키마 예시를 포함해 입력 토큰이 ~3,000을 초과했고, PRD가 길 경우 Claude가 출력을 중간에 자르는 현상이 발생했다. 스키마를 필드명+타입 인라인 목록으로 압축해 프롬프트 고정 부분을 ~300 토큰으로 줄인 후 truncation이 재현되지 않는다.