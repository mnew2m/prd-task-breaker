import { ref, computed } from 'vue'
import { analysisApi } from '../api/analysisApi'
import type { PrdAnalysisResponse } from '../types/analysis'

export function useAnalysis() {
  const result = ref<PrdAnalysisResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const hasResult = computed(() => result.value !== null)

  async function analyze(prdContent: string) {
    if (!prdContent.trim() || prdContent.length < 50) {
      error.value = 'PRD 내용을 50자 이상 입력해주세요.'
      return
    }

    isLoading.value = true
    error.value = null
    result.value = null

    try {
      result.value = await analysisApi.analyze({ prdContent })
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'response' in e) {
        const axiosError = e as { response?: { data?: { message?: string } } }
        error.value = axiosError.response?.data?.message ?? 'AI 분석 중 오류가 발생했습니다.'
      } else {
        error.value = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      }
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    result.value = null
    error.value = null
    isLoading.value = false
  }

  return { result, isLoading, error, hasResult, analyze, reset }
}
