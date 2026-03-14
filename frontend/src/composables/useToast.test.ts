import { describe, it, expect, vi, afterEach } from 'vitest'
import { useToast } from './useToast'

afterEach(() => {
  // 모듈 레벨 상태 초기화 — 테스트 간 격리
  const { toasts } = useToast()
  toasts.value = []
})

describe('useToast', () => {
  it('show adds toast to list', () => {
    const { toasts, show } = useToast()
    show('완료되었습니다')
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].message).toBe('완료되었습니다')
  })

  it('default type is success', () => {
    const { toasts, show } = useToast()
    show('메시지')
    expect(toasts.value[0].type).toBe('success')
  })

  it('custom type is preserved', () => {
    const { toasts, show } = useToast()
    show('에러', 'error')
    expect(toasts.value[0].type).toBe('error')
  })

  it('multiple shows stack toasts', () => {
    const { toasts, show } = useToast()
    show('첫 번째')
    show('두 번째')
    expect(toasts.value).toHaveLength(2)
  })

  it('each toast gets a unique id', () => {
    const { toasts, show } = useToast()
    show('A')
    show('B')
    const ids = toasts.value.map(t => t.id)
    expect(new Set(ids).size).toBe(2)
  })

  it('toast is removed after duration', async () => {
    vi.useFakeTimers()
    const { toasts, show } = useToast()
    show('임시', 'info', 500)
    expect(toasts.value).toHaveLength(1)
    vi.advanceTimersByTime(500)
    expect(toasts.value).toHaveLength(0)
    vi.useRealTimers()
  })

  it('other toasts remain when one expires', async () => {
    vi.useFakeTimers()
    const { toasts, show } = useToast()
    show('짧음', 'info', 300)
    show('긺', 'info', 3000)
    vi.advanceTimersByTime(300)
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].message).toBe('긺')
    vi.useRealTimers()
  })
})
