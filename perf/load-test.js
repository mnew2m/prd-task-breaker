import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend, Rate } from 'k6/metrics'

// ── Custom metrics ──────────────────────────────────────────────────────────
const analysisP95 = new Trend('analysis_duration', true)
const errorRate = new Rate('error_rate')

// ── Test configuration ──────────────────────────────────────────────────────
export const options = {
  scenarios: {
    // Scenario 1: AI 분석 P95 응답시간 — 30초 이내
    single_analysis: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 3,
      maxDuration: '3m',
      tags: { scenario: 'single_analysis' },
    },
    // Scenario 2: 동시 5명 분석 요청 — 타임아웃·에러 없음
    concurrent_analysis: {
      executor: 'per-vu-iterations',
      vus: 5,
      iterations: 1,
      maxDuration: '3m',
      startTime: '20s',
      tags: { scenario: 'concurrent_analysis' },
    },
  },
  thresholds: {
    // P95 응답시간 30초 이내
    analysis_duration: ['p(95)<30000'],
    // 에러율 0%
    error_rate: ['rate==0'],
    http_req_failed: ['rate==0'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080'

const SAMPLE_PRD = `
## 개요
사용자가 PRD 문서를 입력하면 AI가 분석하여 개발 착수 가능한 구조화된 결과를 생성하는 웹 애플리케이션입니다.

## 목표
- PRD 텍스트를 입력받아 기능 목록, 유저 스토리, TODO, API 초안, DB 초안 등 9개 섹션으로 자동 분해
- 개발자가 즉시 사용 가능한 형태로 결과를 제공

## 주요 기능
1. PRD 텍스트 입력 및 유효성 검증 (최소 50자, 단어 수 5개 이상)
2. AI 기반 PRD 분석 (Claude API 사용)
3. 분석 결과 9개 섹션 표시
4. 분석 결과 PDF 내보내기
5. 최근 분석 히스토리 조회
6. 분석 유용성 피드백 (👍/👎)

## 기술 스택
- Frontend: Vue 3 + TypeScript + Vite
- Backend: Spring Boot 3.2 + Java 17
- DB: PostgreSQL
- AI: Claude API (claude-haiku)
`.trim()

// ── Main test function ──────────────────────────────────────────────────────
export default function () {
  const payload = JSON.stringify({ content: SAMPLE_PRD })
  const params = {
    headers: { 'Content-Type': 'application/json' },
    timeout: '35s',
  }

  const start = Date.now()
  const res = http.post(`${BASE_URL}/api/v1/analysis`, payload, params)
  const duration = Date.now() - start

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response has id': (r) => {
      try {
        const body = JSON.parse(r.body)
        return body.id !== undefined
      } catch {
        return false
      }
    },
    'response has features': (r) => {
      try {
        const body = JSON.parse(r.body)
        return Array.isArray(body.features)
      } catch {
        return false
      }
    },
    'responded within 30s': () => duration < 30000,
  })

  analysisP95.add(duration)
  errorRate.add(!success)

  sleep(1)
}
