import { ref, computed } from 'vue'
import { analysisApi } from '../api/analysisApi'
import { isCanceledError, classifyError } from '../utils/errors'
import { useToast } from './useToast'
import type { PrdAnalysisResponse } from '../types/analysis'

export function useAnalysis() {
  const { show: showToast } = useToast()
  const result = ref<PrdAnalysisResponse | null>(null)
  const isLoading = ref(false)
  const loadingMode = ref<'analyze' | 'load' | null>(null)
  const error = ref<string | null>(null)
  const errorHint = ref<string | null>(null)
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
    loadingMode.value = 'analyze'
    error.value = null
    errorHint.value = null
    result.value = null

    try {
      result.value = await analysisApi.analyze({ prdContent }, abortController.value.signal)
      await loadRecent()
      showToast('분석이 완료되었습니다')
    } catch (e: unknown) {
      if (isCanceledError(e)) return  // 사용자 취소 — 정상 흐름, 에러 표시 없음
      const classified = classifyError(e)
      error.value = classified.message
      errorHint.value = classified.hint ?? null
    } finally {
      isLoading.value = false
      loadingMode.value = null
    }
  }

  async function loadById(id: number) {
    isLoading.value = true
    loadingMode.value = 'load'
    error.value = null
    errorHint.value = null
    try {
      result.value = await analysisApi.getById(id)
    } catch (e: unknown) {
      const classified = classifyError(e)
      error.value = classified.message
      errorHint.value = classified.hint ?? null
    } finally {
      isLoading.value = false
      loadingMode.value = null
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
    errorHint.value = null
    isLoading.value = false
    loadingMode.value = null
  }

  return { result, isLoading, loadingMode, error, errorHint, hasResult, recentList, analyze, loadById, loadRecent, reset }
}
