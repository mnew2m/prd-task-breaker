import { isAxiosError } from 'axios'

/**
 * Axios가 AbortController.abort()로 요청을 취소했을 때 던지는 에러인지 확인한다.
 * 사용자가 명시적으로 취소한 경우이므로 에러 메시지를 표시하지 않는 정상 흐름으로 처리한다.
 */
export function isCanceledError(e: unknown): boolean {
  return isAxiosError(e) && e.code === 'ERR_CANCELED'
}

/**
 * Axios 응답 에러에서 서버가 내려준 message를 추출한다.
 * 응답 자체가 없으면 (네트워크 오류 등) null을 반환한다.
 */
export function extractApiErrorMessage(e: unknown): string | null {
  if (isAxiosError(e)) {
    return (e.response?.data as { message?: string })?.message ?? null
  }
  return null
}

/**
 * 에러를 HTTP 상태코드와 네트워크 상태 기반으로 분류해
 * 사용자 친화적 메시지와 행동 힌트를 반환한다.
 */
export function classifyError(e: unknown): { message: string; hint?: string } {
  if (!isAxiosError(e)) {
    return { message: '알 수 없는 오류가 발생했습니다.' }
  }

  // 응답 없음 = 네트워크/연결 오류
  if (!e.response) {
    return {
      message: '서버에 연결할 수 없습니다.',
      hint: '인터넷 연결 상태를 확인하거나, 잠시 후 다시 시도해주세요.',
    }
  }

  const status = e.response.status
  const serverMessage = (e.response.data as { message?: string })?.message

  if (status === 400) {
    return { message: serverMessage ?? '입력 내용을 확인해주세요.' }
  }
  if (status === 404) {
    return { message: '요청한 분석 결과를 찾을 수 없습니다.' }
  }
  if (status === 408) {
    return {
      message: 'AI 응답 시간이 초과됐습니다.',
      hint: 'PRD를 핵심 기능 위주로 줄여서 다시 시도해보세요.',
    }
  }
  if (status >= 500) {
    return {
      message: serverMessage ?? 'AI 분석 중 오류가 발생했습니다.',
      hint: 'PRD 내용을 줄이거나 잠시 후 다시 시도해주세요.',
    }
  }

  return {
    message: serverMessage ?? '오류가 발생했습니다.',
    hint: '잠시 후 다시 시도해주세요.',
  }
}
