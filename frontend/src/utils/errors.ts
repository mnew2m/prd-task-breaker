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
