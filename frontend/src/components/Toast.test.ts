import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Toast from './Toast.vue'
import { useToast } from '../composables/useToast'

afterEach(() => {
  const { toasts } = useToast()
  toasts.value = []
})

describe('Toast', () => {
  it('renders nothing when no toasts', () => {
    const wrapper = mount(Toast)
    expect(wrapper.findAll('.toast')).toHaveLength(0)
  })

  it('renders toast message after show()', async () => {
    const { show } = useToast()
    show('저장되었습니다')
    const wrapper = mount(Toast)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.toast').exists()).toBe(true)
    expect(wrapper.find('.toast').text()).toBe('저장되었습니다')
  })

  it('applies toast-success class by default', async () => {
    const { show } = useToast()
    show('성공')
    const wrapper = mount(Toast)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.toast').classes()).toContain('toast-success')
  })

  it('applies toast-error class for error type', async () => {
    const { show } = useToast()
    show('에러', 'error')
    const wrapper = mount(Toast)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.toast').classes()).toContain('toast-error')
  })

  it('applies toast-info class for info type', async () => {
    const { show } = useToast()
    show('안내', 'info')
    const wrapper = mount(Toast)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.toast').classes()).toContain('toast-info')
  })

  it('renders multiple toasts simultaneously', async () => {
    const { show } = useToast()
    show('첫번째')
    show('두번째')
    const wrapper = mount(Toast)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.toast')).toHaveLength(2)
  })

  it('toast container has aria-live="polite"', () => {
    const wrapper = mount(Toast)
    expect(wrapper.find('.toast-container').attributes('aria-live')).toBe('polite')
  })

  it('toast disappears after duration via fake timer', async () => {
    vi.useFakeTimers()
    const { show } = useToast()
    show('임시', 'info', 500)
    const wrapper = mount(Toast)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.toast')).toHaveLength(1)

    vi.advanceTimersByTime(500)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.toast')).toHaveLength(0)
    vi.useRealTimers()
  })
})
