import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingState from './LoadingState.vue'

describe('LoadingState', () => {
  it('renders loading message', () => {
    const wrapper = mount(LoadingState, { props: { mode: 'analyze' } })
    expect(wrapper.text()).toContain('AI가 PRD를 분석하고 있습니다')
  })

  it('has role="status" and aria-live="polite"', () => {
    const wrapper = mount(LoadingState, { props: { mode: 'analyze' } })
    const container = wrapper.find('.loading-state')
    expect(container.attributes('role')).toBe('status')
    expect(container.attributes('aria-live')).toBe('polite')
  })

  it('renders cancel button', () => {
    const wrapper = mount(LoadingState, { props: { mode: 'analyze' } })
    expect(wrapper.find('.cancel-btn').exists()).toBe(true)
    expect(wrapper.find('.cancel-btn').text()).toContain('분석 취소')
  })

  it('shows confirm dialog when cancel button clicked', async () => {
    const wrapper = mount(LoadingState, { props: { mode: 'analyze' } })
    expect(wrapper.find('.confirm-overlay').exists()).toBe(false)
    await wrapper.find('.cancel-btn').trigger('click')
    expect(wrapper.find('.confirm-overlay').exists()).toBe(true)
  })

  it('hides dialog on 취소 (cancel) click without emitting cancel', async () => {
    const wrapper = mount(LoadingState, { props: { mode: 'analyze' } })
    await wrapper.find('.cancel-btn').trigger('click')
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.find('.confirm-overlay').exists()).toBe(false)
    expect(wrapper.emitted('cancel')).toBeFalsy()
  })

  it('emits cancel and hides dialog on 확인 (confirm) click', async () => {
    const wrapper = mount(LoadingState, { props: { mode: 'analyze' } })
    await wrapper.find('.cancel-btn').trigger('click')
    await wrapper.find('.btn-confirm').trigger('click')
    expect(wrapper.find('.confirm-overlay').exists()).toBe(false)
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('shows load message when mode is load', () => {
    const wrapper = mount(LoadingState, { props: { mode: 'load' } })
    expect(wrapper.text()).toContain('이전 분석 결과를 불러오고 있습니다')
  })

  it('hides hint and cancel button when mode is load', () => {
    const wrapper = mount(LoadingState, { props: { mode: 'load' } })
    expect(wrapper.find('.hint').exists()).toBe(false)
    expect(wrapper.find('.cancel-btn').exists()).toBe(false)
  })
})
