# API Specification

## Base URL
`http://localhost:8080/api/v1`

## Endpoints

### POST /analysis
PRD 분석 요청

**Request Body:**
```json
{
  "prdContent": "string (50~50000 chars)"
}
```

**Response 200:**
```json
{
  "id": "long",
  "features": [
    { "name": "string", "description": "string", "priority": "string", "notes": "string" }
  ],
  "userStories": [
    { "role": "string", "action": "string", "benefit": "string", "acceptanceCriteria": ["string"], "notes": "string" }
  ],
  "todos": [
    { "task": "string", "category": "string", "priority": "string", "estimatedEffort": "string", "notes": "string" }
  ],
  "apiDrafts": [
    { "method": "string", "path": "string", "description": "string", "requestBody": "string", "responseBody": "string", "notes": "string" }
  ],
  "dbDrafts": [
    { "tableName": "string", "columns": ["string"], "notes": "string" }
  ],
  "testChecklist": [
    { "item": "string", "category": "string", "uncertain": false }
  ],
  "releaseChecklist": [
    { "item": "string", "category": "string", "uncertain": false }
  ],
  "uncertainItems": ["string"],
  "readmeDraft": "string",
  "createdAt": "ISO8601"
}
```

**Response 400:**
```json
{ "status": 400, "error": "Bad Request", "message": "prdContent must not be blank", "timestamp": "ISO8601" }
```

**Response 500:**
```json
{ "status": 500, "error": "Internal Server Error", "message": "AI processing failed", "timestamp": "ISO8601" }
```

### GET /analysis/{id}
분석 결과 조회

### GET /analysis
최근 분석 목록 (최대 20개)

### GET /health
헬스체크 → `{ "status": "UP" }`
