import { describe, it, expect } from 'vitest'
import axios from 'axios'
import { isCanceledError, extractApiErrorMessage, classifyError } from './errors'

function makeAxiosError(code: string, responseData?: unknown) {
  return Object.assign(new axios.AxiosError('test', code), {
    response: responseData ? { data: responseData } : undefined,
  })
}

describe('isCanceledError', () => {
  it('returns true for AxiosError with ERR_CANCELED', () => {
    expect(isCanceledError(makeAxiosError('ERR_CANCELED'))).toBe(true)
  })

  it('returns false for AxiosError with other codes', () => {
    expect(isCanceledError(makeAxiosError('ERR_NETWORK'))).toBe(false)
    expect(isCanceledError(makeAxiosError('ERR_BAD_REQUEST'))).toBe(false)
  })

  it('returns false for plain object (not AxiosError)', () => {
    expect(isCanceledError({ code: 'ERR_CANCELED' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isCanceledError(null)).toBe(false)
  })

  it('returns false for non-object', () => {
    expect(isCanceledError('ERR_CANCELED')).toBe(false)
    expect(isCanceledError(undefined)).toBe(false)
  })
})

describe('extractApiErrorMessage', () => {
  it('extracts message from AxiosError response', () => {
    const err = makeAxiosError('ERR_BAD_RESPONSE', { message: '서버 오류' })
    expect(extractApiErrorMessage(err)).toBe('서버 오류')
  })

  it('returns null when response has no message field', () => {
    const err = makeAxiosError('ERR_BAD_RESPONSE', {})
    expect(extractApiErrorMessage(err)).toBeNull()
  })

  it('returns null when no response (network error)', () => {
    const err = makeAxiosError('ERR_NETWORK')
    expect(extractApiErrorMessage(err)).toBeNull()
  })

  it('returns null for plain object (not AxiosError)', () => {
    expect(extractApiErrorMessage({ response: { data: { message: '오류' } } })).toBeNull()
  })

  it('returns null for null input', () => {
    expect(extractApiErrorMessage(null)).toBeNull()
  })

  it('returns null for non-object input', () => {
    expect(extractApiErrorMessage('error')).toBeNull()
  })
})

function makeAxiosErrorWithStatus(status: number, responseData?: unknown) {
  return Object.assign(new axios.AxiosError('test', 'ERR_BAD_RESPONSE'), {
    response: { status, data: responseData ?? {} },
  })
}

describe('classifyError', () => {
  it('non-AxiosError → 알 수 없는 오류', () => {
    expect(classifyError(new Error('plain'))).toEqual({ message: '알 수 없는 오류가 발생했습니다.' })
    expect(classifyError('string error')).toEqual({ message: '알 수 없는 오류가 발생했습니다.' })
  })

  it('응답 없음(네트워크 오류) → 서버에 연결할 수 없습니다 + hint', () => {
    const err = makeAxiosError('ERR_NETWORK')
    const result = classifyError(err)
    expect(result.message).toBe('서버에 연결할 수 없습니다.')
    expect(result.hint).toBeTruthy()
  })

  it('400 + serverMessage → serverMessage 반환', () => {
    const err = makeAxiosErrorWithStatus(400, { message: '입력이 너무 짧습니다' })
    expect(classifyError(err)).toEqual({ message: '입력이 너무 짧습니다' })
  })

  it('400 + no message → 입력 내용을 확인해주세요', () => {
    const err = makeAxiosErrorWithStatus(400)
    expect(classifyError(err)).toEqual({ message: '입력 내용을 확인해주세요.' })
  })

  it('404 → 요청한 분석 결과를 찾을 수 없습니다', () => {
    const err = makeAxiosErrorWithStatus(404)
    expect(classifyError(err)).toEqual({ message: '요청한 분석 결과를 찾을 수 없습니다.' })
  })

  it('408 → AI 응답 시간이 초과됐습니다 + hint', () => {
    const err = makeAxiosErrorWithStatus(408)
    const result = classifyError(err)
    expect(result.message).toBe('AI 응답 시간이 초과됐습니다.')
    expect(result.hint).toBeTruthy()
  })

  it('500 + serverMessage → serverMessage 반환', () => {
    const err = makeAxiosErrorWithStatus(500, { message: 'AI 응답 파싱 실패' })
    const result = classifyError(err)
    expect(result.message).toBe('AI 응답 파싱 실패')
    expect(result.hint).toBeTruthy()
  })

  it('500 + no message → AI 분석 중 오류가 발생했습니다 + hint', () => {
    const err = makeAxiosErrorWithStatus(500)
    const result = classifyError(err)
    expect(result.message).toBe('AI 분석 중 오류가 발생했습니다.')
    expect(result.hint).toBeTruthy()
  })

  it('기타 status + serverMessage → serverMessage 반환', () => {
    const err = makeAxiosErrorWithStatus(403, { message: '접근 권한이 없습니다' })
    expect(classifyError(err).message).toBe('접근 권한이 없습니다')
  })

  it('기타 status + no message → 오류가 발생했습니다 + hint', () => {
    const err = makeAxiosErrorWithStatus(403)
    const result = classifyError(err)
    expect(result.message).toBe('오류가 발생했습니다.')
    expect(result.hint).toBeTruthy()
  })
})
