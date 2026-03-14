import { describe, it, expect } from 'vitest'
import axios from 'axios'
import { isCanceledError, extractApiErrorMessage } from './errors'

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
