import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorState from './ErrorState.vue'

describe('ErrorState', () => {
  it('renders error message with role="alert"', () => {
    const wrapper = mount(ErrorState, { props: { message: '서버에 연결할 수 없습니다.' } })
    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('서버에 연결할 수 없습니다.')
  })

  it('shows hint text when hint prop is provided', () => {
    const wrapper = mount(ErrorState, {
      props: { message: '오류 발생', hint: '잠시 후 다시 시도해주세요.' },
    })
    expect(wrapper.find('.error-hint').exists()).toBe(true)
    expect(wrapper.find('.error-hint').text()).toContain('잠시 후 다시 시도해주세요.')
  })

  it('does not render hint area when hint prop is absent', () => {
    const wrapper = mount(ErrorState, { props: { message: '오류 발생' } })
    expect(wrapper.find('.error-hint').exists()).toBe(false)
  })

  it('emits retry when 다시 시도 button is clicked', async () => {
    const wrapper = mount(ErrorState, { props: { message: '오류 발생' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
  })
})
