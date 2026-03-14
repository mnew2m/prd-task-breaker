import { test, expect } from '@playwright/test'

test.describe('PRD Task Breaker — smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page title and header render correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/PRD Task Breaker/)
    await expect(page.getByRole('heading', { name: 'PRD Task Breaker' })).toBeVisible()
  })

  test('PRD textarea is visible and accepts input', async ({ page }) => {
    const textarea = page.getByRole('textbox')
    await expect(textarea).toBeVisible()
    await textarea.fill('테스트 입력입니다')
    await expect(textarea).toHaveValue('테스트 입력입니다')
  })

  test('analyze button is disabled when textarea is empty', async ({ page }) => {
    const textarea = page.getByRole('textbox')
    await textarea.clear()
    const analyzeBtn = page.getByRole('button', { name: 'AI 분석 시작' })
    await expect(analyzeBtn).toBeDisabled()
  })

  test('analyze button becomes enabled after sufficient input', async ({ page }) => {
    const textarea = page.getByRole('textbox')
    // 50자 이상 입력해야 활성화
    await textarea.fill('사용자는 로그인 기능을 통해 서비스에 접근할 수 있어야 한다. 비밀번호 분실 시 이메일로 재설정 링크를 받을 수 있어야 한다.')
    const analyzeBtn = page.getByRole('button', { name: 'AI 분석 시작' })
    await expect(analyzeBtn).toBeEnabled()
  })

  test('sample PRD load button populates textarea', async ({ page }) => {
    const loadBtn = page.getByRole('button', { name: /샘플/ })
    await expect(loadBtn).toBeVisible()
    await loadBtn.click()
    const textarea = page.getByRole('textbox')
    const value = await textarea.inputValue()
    expect(value.length).toBeGreaterThan(50)
  })

  test('API mocked: analyze flow shows result', async ({ page }) => {
    const mockResult = {
      id: 1,
      features: [{ name: '로그인', description: '사용자 인증', priority: 'HIGH', notes: null }],
      userStories: [],
      todos: [{ task: '로그인 API 구현', category: 'BACKEND', priority: 'HIGH', estimatedEffort: '1d', notes: null }],
      apiDrafts: [],
      dbDrafts: [],
      testChecklist: [],
      releaseChecklist: [],
      uncertainItems: [],
      readmeDraft: null,
      createdAt: '2026-03-14T00:00:00',
    }

    // POST /api/v1/analysis → 분석 결과 반환
    // GET  /api/v1/analysis → 빈 목록 반환 (recentList)
    await page.route('**/api/v1/analysis', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockResult) })
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      }
    })

    const textarea = page.getByRole('textbox')
    await textarea.fill('사용자는 로그인 기능을 통해 서비스에 접근할 수 있어야 한다. 비밀번호 분실 시 이메일로 재설정 링크를 받을 수 있어야 한다.')
    await page.getByRole('button', { name: 'AI 분석 시작' }).click()

    await expect(page.getByRole('heading', { name: '분석 결과' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('로그인', { exact: true })).toBeVisible()
  })
})
