import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { useAnalysis } from './useAnalysis'
import { useToast } from './useToast'
import { analysisApi } from '../api/analysisApi'

vi.mock('../api/analysisApi')

const VALID_PRD = 'valid prd content that is long enough to pass validation check here'

const mockResponse = {
  id: 1,
  features: [{ name: 'F1', description: 'd', priority: 'HIGH' as const, notes: null }],
  userStories: [],
  todos: [],
  apiDrafts: [],
  dbDrafts: [],
  testChecklist: [],
  releaseChecklist: [],
  uncertainItems: [],
  readmeDraft: null,
  createdAt: '2026-03-13T00:00:00'
}

const mockResponse2 = { ...mockResponse, id: 2, createdAt: '2026-03-13T01:00:00' }

describe('useAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(analysisApi.getRecent).mockResolvedValue([])
  })

  afterEach(() => {
    const { toasts } = useToast()
    toasts.value = []
  })

  // ── analyze ──────────────────────────────────────────────────────────────

  it('analyze success sets result', async () => {
    vi.mocked(analysisApi.analyze).mockResolvedValue(mockResponse)

    const { result, isLoading, error, analyze } = useAnalysis()
    await analyze(VALID_PRD)

    expect(result.value).toEqual(mockResponse)
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('analyze too short sets error without calling api', async () => {
    const { error, analyze } = useAnalysis()
    await analyze('short')

    expect(error.value).toContain('50자')
    expect(analysisApi.analyze).not.toHaveBeenCalled()
  })

  it('analyze api failure sets error message from response', async () => {
    vi.mocked(analysisApi.analyze).mockRejectedValue(
      Object.assign(new axios.AxiosError('AI failed', 'ERR_BAD_RESPONSE'), {
        response: { data: { message: 'AI failed' } },
      })
    )

    const { error, analyze } = useAnalysis()
    await analyze(VALID_PRD)

    expect(error.value).toBe('AI failed')
  })

  it('analyze network failure sets generic error message', async () => {
    vi.mocked(analysisApi.analyze).mockRejectedValue(new Error('Network Error'))

    const { error, analyze } = useAnalysis()
    await analyze(VALID_PRD)

    expect(error.value).toContain('서버에 연결할 수 없습니다')
  })

  it('analyze success shows toast notification', async () => {
    vi.mocked(analysisApi.analyze).mockResolvedValue(mockResponse)

    const { toasts } = useToast()
    const { analyze } = useAnalysis()
    await analyze(VALID_PRD)

    expect(toasts.value.some(t => t.message === '분석이 완료되었습니다')).toBe(true)
  })

  it('analyze success auto-refreshes recentList', async () => {
    vi.mocked(analysisApi.analyze).mockResolvedValue(mockResponse)
    vi.mocked(analysisApi.getRecent).mockResolvedValue([mockResponse])

    const { recentList, analyze } = useAnalysis()
    await analyze(VALID_PRD)

    expect(analysisApi.getRecent).toHaveBeenCalledOnce()
    expect(recentList.value).toEqual([mockResponse])
  })

  // ── loadById ─────────────────────────────────────────────────────────────

  it('loadById success sets result', async () => {
    vi.mocked(analysisApi.getById).mockResolvedValue(mockResponse)

    const { result, isLoading, error, loadById } = useAnalysis()
    await loadById(1)

    expect(result.value).toEqual(mockResponse)
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('loadById failure sets error', async () => {
    vi.mocked(analysisApi.getById).mockRejectedValue(new Error('Not found'))

    const { result, error, loadById } = useAnalysis()
    await loadById(999)

    expect(result.value).toBeNull()
    expect(error.value).toContain('불러올 수 없습니다')
  })

  it('loadById sets isLoading false after completion', async () => {
    vi.mocked(analysisApi.getById).mockResolvedValue(mockResponse)

    const { isLoading, loadById } = useAnalysis()
    await loadById(1)

    expect(isLoading.value).toBe(false)
  })

  // ── loadRecent ────────────────────────────────────────────────────────────

  it('loadRecent success sets recentList', async () => {
    vi.mocked(analysisApi.getRecent).mockResolvedValue([mockResponse, mockResponse2])

    const { recentList, loadRecent } = useAnalysis()
    await loadRecent()

    expect(recentList.value).toHaveLength(2)
    expect(recentList.value[0].id).toBe(1)
    expect(recentList.value[1].id).toBe(2)
  })

  it('loadRecent starts with empty list', () => {
    const { recentList } = useAnalysis()
    expect(recentList.value).toEqual([])
  })

  it('loadRecent failure silently ignores error (list stays empty)', async () => {
    vi.mocked(analysisApi.getRecent).mockRejectedValue(new Error('server down'))

    const { recentList, loadRecent } = useAnalysis()
    await expect(loadRecent()).resolves.toBeUndefined()
    expect(recentList.value).toEqual([])
  })

  // ── reset ─────────────────────────────────────────────────────────────────

  it('reset clears result and error', async () => {
    vi.mocked(analysisApi.analyze).mockResolvedValue(mockResponse)

    const { result, error, hasResult, analyze, reset } = useAnalysis()
    await analyze(VALID_PRD)
    expect(hasResult.value).toBe(true)

    reset()
    expect(result.value).toBeNull()
    expect(error.value).toBeNull()
    expect(hasResult.value).toBe(false)
  })
})
