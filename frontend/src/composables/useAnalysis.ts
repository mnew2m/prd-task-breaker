import { ref, computed } from 'vue'
import { analysisApi } from '../api/analysisApi'
import type { PrdAnalysisResponse } from '../types/analysis'
import type { ApiError } from '../types/api'

export function useAnalysis() {
  const result = ref<PrdAnalysisResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const recentList = ref<PrdAnalysisResponse[]>([])
  const abortController = ref<AbortController | null>(null)

  const hasResult = computed(() => result.value !== null)

  async function analyze(prdContent: string) {
    if (!prdContent.trim() || prdContent.length < 50) {
      error.value = 'PRD 내용을 50자 이상 입력해주세요.'
      return
    }

    // Abort any in-flight request before starting a new one
    abortController.value?.abort()
    abortController.value = new AbortController()

    isLoading.value = true
    error.value = null
    result.value = null

    try {
      result.value = await analysisApi.analyze({ prdContent }, abortController.value.signal)
      await loadRecent()
    } catch (e: unknown) {
      // Ignore aborted requests
      if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'ERR_CANCELED') {
        return
      }
      if (e && typeof e === 'object' && 'response' in e) {
        const axiosError = e as { response?: { data?: ApiError } }
        error.value = axiosError.response?.data?.message ?? 'AI 분석 중 오류가 발생했습니다.'
      } else {
        error.value = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      }
    } finally {
      isLoading.value = false
    }
  }

  async function loadById(id: number) {
    isLoading.value = true
    error.value = null
    try {
      result.value = await analysisApi.getById(id)
    } catch {
      error.value = '분석 결과를 불러올 수 없습니다.'
    } finally {
      isLoading.value = false
    }
  }

  async function loadRecent() {
    try {
      recentList.value = await analysisApi.getRecent()
    } catch {
      // 목록 로딩 실패는 조용히 무시
    }
  }

  function reset() {
    abortController.value?.abort()
    abortController.value = null
    result.value = null
    error.value = null
    isLoading.value = false
  }

  return { result, isLoading, error, hasResult, recentList, analyze, loadById, loadRecent, reset }
}
