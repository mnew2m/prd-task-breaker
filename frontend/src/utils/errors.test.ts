import { describe, it, expect } from 'vitest'
import { isCanceledError, extractApiErrorMessage } from './errors'

describe('isCanceledError', () => {
  it('returns true for ERR_CANCELED', () => {
    expect(isCanceledError({ code: 'ERR_CANCELED' })).toBe(true)
  })

  it('returns false for other error codes', () => {
    expect(isCanceledError({ code: 'ERR_NETWORK' })).toBe(false)
    expect(isCanceledError({ code: 'ERR_BAD_REQUEST' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isCanceledError(null)).toBe(false)
  })

  it('returns false for non-object', () => {
    expect(isCanceledError('ERR_CANCELED')).toBe(false)
    expect(isCanceledError(undefined)).toBe(false)
  })

  it('returns false for object without code', () => {
    expect(isCanceledError({ message: 'ERR_CANCELED' })).toBe(false)
  })
})

describe('extractApiErrorMessage', () => {
  it('extracts message from axios error response', () => {
    const err = { response: { data: { message: '서버 오류' } } }
    expect(extractApiErrorMessage(err)).toBe('서버 오류')
  })

  it('returns null when response has no message field', () => {
    const err = { response: { data: {} } }
    expect(extractApiErrorMessage(err)).toBeNull()
  })

  it('returns null when no response (network error)', () => {
    const err = { code: 'ERR_NETWORK' }
    expect(extractApiErrorMessage(err)).toBeNull()
  })

  it('returns null for null input', () => {
    expect(extractApiErrorMessage(null)).toBeNull()
  })

  it('returns null for non-object input', () => {
    expect(extractApiErrorMessage('error')).toBeNull()
  })
})
