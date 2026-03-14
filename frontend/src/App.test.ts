import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

vi.mock('./api/analysisApi', () => ({
  analysisApi: {
    analyze: vi.fn(),
    getById: vi.fn(),
    getRecent: vi.fn().mockResolvedValue([]),
  },
}))

const stubs = {
  PrdInput: { template: '<div />' },
  AnalysisResult: { template: '<div />' },
  LoadingState: { template: '<div />' },
  ErrorState: { template: '<div />' },
  AnalysisHistory: { template: '<div />', props: ['recentList'] },
  Zap: { template: '<span />' },
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
})

describe('App scroll-to-top', () => {
  it('scroll-top-btn not rendered initially', () => {
    const wrapper = mount(App, { global: { stubs } })
    expect(wrapper.find('.scroll-top-btn').exists()).toBe(false)
  })

  it('renders after scrollY > 300', async () => {
    const wrapper = mount(App, { global: { stubs } })
    Object.defineProperty(window, 'scrollY', { value: 301, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.scroll-top-btn').exists()).toBe(true)
  })

  it('hides when scrollY back <= 300', async () => {
    const wrapper = mount(App, { global: { stubs } })
    Object.defineProperty(window, 'scrollY', { value: 301, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()

    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.scroll-top-btn').exists()).toBe(false)
  })

  it('calls window.scrollTo on click', async () => {
    const wrapper = mount(App, { global: { stubs } })
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    Object.defineProperty(window, 'scrollY', { value: 301, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()

    await wrapper.find('.scroll-top-btn').trigger('click')
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })

    scrollToSpy.mockRestore()
  })
})
