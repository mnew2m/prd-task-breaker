import { describe, it, expect } from 'vitest'
import { priorityClass } from './priority'

describe('priorityClass', () => {
  it('returns badge-high for HIGH', () => {
    const cls = priorityClass('HIGH')
    expect(cls['badge-high']).toBe(true)
    expect(cls['badge-medium']).toBe(false)
    expect(cls['badge-low']).toBe(false)
  })

  it('returns badge-medium for MEDIUM', () => {
    const cls = priorityClass('MEDIUM')
    expect(cls['badge-high']).toBe(false)
    expect(cls['badge-medium']).toBe(true)
    expect(cls['badge-low']).toBe(false)
  })

  it('returns badge-low for LOW', () => {
    const cls = priorityClass('LOW')
    expect(cls['badge-high']).toBe(false)
    expect(cls['badge-medium']).toBe(false)
    expect(cls['badge-low']).toBe(true)
  })

  it('returns all false for unknown value', () => {
    const cls = priorityClass('UNKNOWN')
    expect(cls['badge-high']).toBe(false)
    expect(cls['badge-medium']).toBe(false)
    expect(cls['badge-low']).toBe(false)
  })
})
