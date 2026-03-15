/**
 * 통합 E2E 테스트 — 실제 백엔드(MockAiClient + H2) 연동 검증
 *
 * 실행 전제: 백엔드가 http://localhost:8080 에서 동작 중이어야 한다.
 *   로컬: docker compose up
 *   CI: e2e-integration 잡에서 gradle bootRun 으로 백엔드 기동 후 실행
 *
 * mock 없이 실제 요청을 보내므로 smoke.spec.ts / user-flows.spec.ts 와 다르다.
 */
import { test, expect, request } from '@playwright/test'

const PRD_INPUT =
  '사용자는 이메일과 패스워드로 로그인할 수 있어야 한다. ' +
  '로그인 실패 시 에러 메시지를 표시하고, 비밀번호 분실 시 이메일로 재설정 링크를 보낸다. ' +
  '관리자는 사용자 목록을 조회하고 계정을 비활성화할 수 있어야 한다.'

test.describe('통합 E2E — 실제 백엔드 연동', () => {
  // ------------------------------------------------------------------ //
  // 1. 헬스체크
  // ------------------------------------------------------------------ //
  test('헬스체크: GET /api/v1/health → 200', async ({ page }) => {
    const response = await page.request.get('http://localhost:8080/api/v1/health')
    expect(response.status()).toBe(200)
  })

  // ------------------------------------------------------------------ //
  // 2. 분석 플로우
  // ------------------------------------------------------------------ //
  test('분석 플로우: PRD 입력 → 분석 → AnalysisResult 표시', async ({ page }) => {
    await page.goto('/')

    const textarea = page.getByRole('textbox')
    await textarea.fill(PRD_INPUT)

    await page.getByRole('button', { name: 'AI 분석 시작' }).click()

    // MockAiClient 응답이 돌아올 때까지 대기 (최대 15초)
    await expect(page.getByRole('heading', { name: '분석 결과' })).toBeVisible({ timeout: 15_000 })

    // MockAiClient 고정 응답의 주요 필드 확인
    await expect(page.getByText('사용자 인증', { exact: true })).toBeVisible()
    await expect(page.getByText('Spring Boot 프로젝트 초기 설정')).toBeVisible()
  })

  // ------------------------------------------------------------------ //
  // 3. 히스토리
  // ------------------------------------------------------------------ //
  test('히스토리: 분석 완료 후 최근 목록에 표시', async ({ page }) => {
    await page.goto('/')

    const textarea = page.getByRole('textbox')
    await textarea.fill(PRD_INPUT)
    await page.getByRole('button', { name: 'AI 분석 시작' }).click()

    await expect(page.getByRole('heading', { name: '분석 결과' })).toBeVisible({ timeout: 15_000 })

    // 결과 화면에서 입력 화면으로 복귀해야 히스토리 패널이 보인다
    await page.getByRole('button', { name: '+ 새 분석' }).click()

    // 히스토리 토글 버튼 클릭하여 패널 열기
    const historyToggle = page.getByRole('button', { name: '분석 히스토리' })
    await expect(historyToggle).toBeVisible({ timeout: 5_000 })
    await historyToggle.click()

    const historyItems = page.locator('.history-card')
    await expect(historyItems.first()).toBeVisible({ timeout: 5_000 })
  })

  // ------------------------------------------------------------------ //
  // 4. 피드백
  // ------------------------------------------------------------------ //
  test('피드백: 👍 클릭 → 성공 토스트', async ({ page }) => {
    await page.goto('/')

    const textarea = page.getByRole('textbox')
    await textarea.fill(PRD_INPUT)
    await page.getByRole('button', { name: 'AI 분석 시작' }).click()

    await expect(page.getByRole('heading', { name: '분석 결과' })).toBeVisible({ timeout: 15_000 })

    // 👍 버튼 클릭 (aria-label="유용함"이 accessible name)
    const thumbsUp = page.getByRole('button', { name: '유용함' })
    await expect(thumbsUp).toBeVisible()
    await thumbsUp.click()

    // 성공 토스트 확인 (Toast role="status"로 정확히 타겟, .feedback-done과 구분)
    await expect(page.getByRole('status').filter({ hasText: '저장되었습니다' })).toBeVisible({ timeout: 5_000 })
  })
})
