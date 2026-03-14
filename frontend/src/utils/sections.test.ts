import { describe, it, expect } from 'vitest'
import { SECTION_LABELS, DEFAULT_SECTION_ORDER } from './sections'

describe('sections', () => {
  it('DEFAULT_SECTION_ORDER contains exactly 8 keys', () => {
    expect(DEFAULT_SECTION_ORDER).toHaveLength(8)
  })

  it('DEFAULT_SECTION_ORDER has no duplicates', () => {
    expect(new Set(DEFAULT_SECTION_ORDER).size).toBe(DEFAULT_SECTION_ORDER.length)
  })

  it('SECTION_LABELS has a non-empty label for every key in DEFAULT_SECTION_ORDER', () => {
    for (const key of DEFAULT_SECTION_ORDER) {
      expect(SECTION_LABELS[key]).toBeTruthy()
    }
  })

  it('SECTION_LABELS key count matches DEFAULT_SECTION_ORDER length', () => {
    expect(Object.keys(SECTION_LABELS)).toHaveLength(DEFAULT_SECTION_ORDER.length)
  })

  it('DEFAULT_SECTION_ORDER starts with features', () => {
    expect(DEFAULT_SECTION_ORDER[0]).toBe('features')
  })
})
