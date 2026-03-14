# API Specification

## Base URL
`http://localhost:8080/api/v1`

---

## 공통 오류 응답 형식

모든 4xx/5xx 응답은 아래 구조를 따릅니다.

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "오류 설명",
  "timestamp": "2026-03-15T10:00:00"
}
```

| HTTP 상태 | error 값 | 발생 조건 |
|-----------|----------|---------|
| 400 | Bad Request | 입력 유효성 검증 실패 (`@NotBlank`, `@Size`, `@ValidPrdContent`, `@NotNull`) |
| 404 | Not Found | 해당 id가 존재하지 않음 (`EntityNotFoundException`) |
| 500 | Internal Server Error | AI 처리 실패 또는 분석이 COMPLETED 상태가 아님 (`AiProcessingException`) |

---

## Endpoints

### POST /analysis
PRD 분석 요청

**Request Body:**
```json
{
  "prdContent": "string"
}
```

| 필드 | 타입 | 제약 |
|------|------|------|
| `prdContent` | string | 필수, 50~50000자, 최소 5개 단어, 단일 문자 반복 50% 미만 |

**Response 200:**
```json
{
  "id": 1,
  "features": [
    { "name": "string", "description": "string", "priority": "HIGH|MEDIUM|LOW", "notes": "string|null" }
  ],
  "userStories": [
    { "role": "string", "action": "string", "benefit": "string", "acceptanceCriteria": ["string"], "notes": "string|null" }
  ],
  "todos": [
    { "task": "string", "category": "string", "priority": "HIGH|MEDIUM|LOW", "estimatedEffort": "string", "notes": "string|null" }
  ],
  "apiDrafts": [
    { "method": "GET|POST|PUT|PATCH|DELETE", "path": "string", "description": "string", "requestBody": "string|null", "responseBody": "string|null", "notes": "string|null" }
  ],
  "dbDrafts": [
    { "tableName": "string", "columns": ["string"], "notes": "string|null" }
  ],
  "testChecklist": [
    { "item": "string", "category": "string", "uncertain": false }
  ],
  "releaseChecklist": [
    { "item": "string", "category": "string", "uncertain": false }
  ],
  "uncertainItems": ["string"],
  "readmeDraft": "string|null",
  "createdAt": "2026-03-15T10:00:00",
  "useful": null
}
```

**Response 400:**
```json
{ "status": 400, "error": "Bad Request", "message": "PRD content must not be blank", "timestamp": "2026-03-15T10:00:00" }
```

**Response 500:**
```json
{ "status": 500, "error": "Internal Server Error", "message": "AI processing failed", "timestamp": "2026-03-15T10:00:00" }
```

---

### GET /analysis/{id}
분석 결과 조회

**Path Parameter:** `id` (Long) — 분석 결과 ID

**Response 200:** POST /analysis 응답과 동일한 구조. 피드백 제출 후에는 `useful` 필드가 `true` 또는 `false`로 채워집니다.

```json
{
  "id": 1,
  "features": [...],
  "userStories": [...],
  "todos": [...],
  "apiDrafts": [...],
  "dbDrafts": [...],
  "testChecklist": [...],
  "releaseChecklist": [...],
  "uncertainItems": [...],
  "readmeDraft": "string|null",
  "createdAt": "2026-03-15T10:00:00",
  "useful": true
}
```

**Response 404:**
```json
{ "status": 404, "error": "Not Found", "message": "Analysis not found with id: 999", "timestamp": "2026-03-15T10:00:00" }
```

**Response 500** (COMPLETED 아닌 상태 조회 시):
```json
{ "status": 500, "error": "Internal Server Error", "message": "Analysis is not completed. Status: PENDING", "timestamp": "2026-03-15T10:00:00" }
```

---

### GET /analysis
최근 분석 목록 조회 (COMPLETED 상태만, 최신순)

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 제약 |
|---------|------|--------|------|
| `limit` | int | 3 | 1~100 |

**Response 200:**
```json
[
  {
    "id": 2,
    "features": [...],
    "userStories": [...],
    "todos": [...],
    "apiDrafts": [...],
    "dbDrafts": [...],
    "testChecklist": [...],
    "releaseChecklist": [...],
    "uncertainItems": [...],
    "readmeDraft": "string|null",
    "createdAt": "2026-03-15T10:01:00",
    "useful": null
  },
  {
    "id": 1,
    "createdAt": "2026-03-15T10:00:00",
    "useful": true,
    ...
  }
]
```

빈 배열(`[]`)도 정상 응답(200)입니다.

**Response 400** (`limit` 범위 초과 시):
```json
{ "status": 400, "error": "Bad Request", "message": "getRecent.limit: must be less than or equal to 100", "timestamp": "2026-03-15T10:00:00" }
```

---

### PATCH /analysis/{id}/feedback
분석 결과 유용성 피드백 제출

**Path Parameter:** `id` (Long) — 분석 결과 ID

**Request Body:**
```json
{
  "useful": true
}
```

| 필드 | 타입 | 제약 |
|------|------|------|
| `useful` | boolean | 필수 (`@NotNull`). `true` = 유용함, `false` = 유용하지 않음 |

**Response 200:** 업데이트된 분석 결과 전체 반환 (GET /analysis/{id}와 동일 구조, `useful` 필드 반영됨)

```json
{
  "id": 1,
  "features": [...],
  "useful": true,
  "createdAt": "2026-03-15T10:00:00",
  ...
}
```

**Response 400** (`useful` 필드 누락 시):
```json
{ "status": 400, "error": "Bad Request", "message": "useful: must not be null", "timestamp": "2026-03-15T10:00:00" }
```

**Response 404:**
```json
{ "status": 404, "error": "Not Found", "message": "Analysis not found with id: 999", "timestamp": "2026-03-15T10:00:00" }
```

**Response 500** (COMPLETED 아닌 상태에 피드백 시):
```json
{ "status": 500, "error": "Internal Server Error", "message": "Analysis is not completed. Status: PENDING", "timestamp": "2026-03-15T10:00:00" }
```

---

### GET /health
헬스체크

**Response 200:**
```json
{ "status": "UP" }
```
