import { test, expect } from '@playwright/test'

const LONG_PRD = '사용자는 로그인 기능을 통해 서비스에 접근할 수 있어야 한다. 비밀번호 분실 시 이메일로 재설정 링크를 받을 수 있어야 한다.'

const mockResult = {
  id: 1,
  features: [{ name: '로그인', description: '사용자 인증', priority: 'HIGH', notes: null }],
  userStories: [],
  todos: [],
  apiDrafts: [],
  dbDrafts: [],
  testChecklist: [],
  releaseChecklist: [],
  uncertainItems: [],
  readmeDraft: null,
  createdAt: '2026-03-14T00:00:00',
}

test.describe('PRD Task Breaker — user flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // ── 에러 처리 ───────────────────────────────────────────────────────────────

  test('API 500 error shows error message', async ({ page }) => {
    await page.route('**/api/v1/analysis', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'AI 서비스에 일시적인 오류가 발생했습니다' }),
        })
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      }
    })

    await page.getByRole('textbox').fill(LONG_PRD)
    await page.getByRole('button', { name: 'AI 분석 시작' }).click()

    await expect(page.getByText('AI 서비스에 일시적인 오류가 발생했습니다')).toBeVisible({ timeout: 10_000 })
    // 에러 후 입력 화면 유지 확인
    await expect(page.getByRole('button', { name: 'AI 분석 시작' })).toBeVisible()
  })

  // ── 분석 취소 ───────────────────────────────────────────────────────────────

  test('cancel analysis returns to input screen', async ({ page }) => {
    // 응답을 지연시켜 로딩 상태 유지
    await page.route('**/api/v1/analysis', async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise((resolve) => setTimeout(resolve, 30_000))
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockResult) })
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      }
    })

    await page.getByRole('textbox').fill(LONG_PRD)
    await page.getByRole('button', { name: 'AI 분석 시작' }).click()

    // 취소 버튼이 로딩 중 표시됨
    await expect(page.getByRole('button', { name: /취소/ })).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: /취소/ }).click()

    // ConfirmDialog 확인 버튼 클릭
    await expect(page.getByRole('button', { name: /확인/ })).toBeVisible()
    await page.getByRole('button', { name: /확인/ }).click()

    // 입력 화면으로 복귀
    await expect(page.getByRole('button', { name: 'AI 분석 시작' })).toBeVisible({ timeout: 5_000 })
  })

  // ── 히스토리에서 이전 결과 불러오기 ─────────────────────────────────────────

  test('clicking history card loads previous analysis result', async ({ page }) => {
    await page.route(/\/api\/v1\/analysis(\?.*)?$/, (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockResult) })
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockResult]) })
      }
    })

    await page.route('**/api/v1/analysis/1', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockResult) })
    })

    // 분석 완료 후 결과 확인
    await page.getByRole('textbox').fill(LONG_PRD)
    await page.getByRole('button', { name: 'AI 분석 시작' }).click()
    await expect(page.getByRole('heading', { name: '분석 결과' })).toBeVisible({ timeout: 10_000 })

    // 새 분석으로 돌아가기
    await page.getByRole('button', { name: '+ 새 분석' }).click()
    await expect(page.getByRole('button', { name: 'AI 분석 시작' })).toBeVisible()

    // 히스토리 패널 열기
    await page.getByRole('button', { name: '분석 히스토리' }).click()
    await expect(page.locator('.history-card').first()).toBeVisible()

    // 히스토리 카드 클릭 → 이전 결과 로딩
    await page.locator('.history-card').first().click()
    await expect(page.getByRole('heading', { name: '분석 결과' })).toBeVisible({ timeout: 10_000 })
  })

  // ── 피드백 제출 ─────────────────────────────────────────────────────────────

  test('feedback buttons appear after analysis and submit successfully', async ({ page }) => {
    await page.route('**/api/v1/analysis', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockResult) })
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      }
    })

    await page.route('**/api/v1/analysis/1/feedback', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockResult, useful: true }),
      })
    })

    await page.getByRole('textbox').fill(LONG_PRD)
    await page.getByRole('button', { name: 'AI 분석 시작' }).click()
    await expect(page.getByRole('heading', { name: '분석 결과' })).toBeVisible({ timeout: 10_000 })

    // 피드백 버튼 표시 확인
    await expect(page.getByRole('button', { name: /유용함/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /아쉬움/ })).toBeVisible()

    // 👍 클릭 후 버튼 비활성화 확인
    await page.getByRole('button', { name: /유용함/ }).click()
    await expect(page.getByRole('status').filter({ hasText: '피드백이 저장되었습니다' })).toBeVisible({ timeout: 5_000 })
  })
})
