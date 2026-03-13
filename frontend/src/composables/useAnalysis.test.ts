import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAnalysis } from './useAnalysis'
import { analysisApi } from '../api/analysisApi'

vi.mock('../api/analysisApi')

const mockResponse = {
  id: 1,
  features: [],
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

describe('useAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('analyze success sets result', async () => {
    vi.mocked(analysisApi.analyze).mockResolvedValue(mockResponse)

    const { result, isLoading, error, analyze } = useAnalysis()
    const validPrd = 'valid prd content that is long enough to pass validation check here'

    await analyze(validPrd)

    expect(result.value).toEqual(mockResponse)
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('analyze too short sets error', async () => {
    const { error, analyze } = useAnalysis()

    await analyze('short')

    expect(error.value).toContain('50자')
  })

  it('analyze api failure sets error message', async () => {
    vi.mocked(analysisApi.analyze).mockRejectedValue({
      response: { data: { message: 'AI failed' } }
    })

    const { error, analyze } = useAnalysis()
    const validPrd = 'valid prd content that is long enough to pass validation check here'

    await analyze(validPrd)

    expect(error.value).toBe('AI failed')
  })
})
