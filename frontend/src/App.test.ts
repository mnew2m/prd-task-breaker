import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from './App.vue'
import * as analysisApiModule from './api/analysisApi'

vi.mock('./api/analysisApi', () => ({
  analysisApi: {
    analyze: vi.fn(),
    getById: vi.fn(),
    getRecent: vi.fn().mockResolvedValue([]),
    submitFeedback: vi.fn(),
  },
}))

const stubs = {
  PrdInput: { template: '<div />' },
  AnalysisResult: {
    name: 'AnalysisResult',
    template: '<div><slot /></div>',
    props: ['result'],
    emits: ['feedback-submitted'],
  },
  LoadingState: { template: '<div />' },
  ErrorState: { template: '<div />' },
  AnalysisHistory: { template: '<div />', props: ['recentList'] },
  Zap: { template: '<span />' },
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
})

describe('App feedback-submitted → loadRecent', () => {
  it('calls getRecent when AnalysisResult emits feedback-submitted', async () => {
    vi.mocked(analysisApiModule.analysisApi.analyze).mockResolvedValue({
      id: 1, features: [], userStories: [], todos: [], apiDrafts: [], dbDrafts: [],
      testChecklist: [], releaseChecklist: [], uncertainItems: [], readmeDraft: null,
      createdAt: '2026-03-13T00:00:00',
    })
    vi.mocked(analysisApiModule.analysisApi.getRecent).mockResolvedValue([])

    const wrapper = mount(App, { global: { stubs } })
    // analyze → result 상태 진입
    await (wrapper.vm as unknown as { analyze: (s: string) => Promise<void> }).analyze(
      'a'.repeat(50)
    )
    await flushPromises()

    const callsBefore = vi.mocked(analysisApiModule.analysisApi.getRecent).mock.calls.length

    const analysisResultStub = wrapper.findComponent({ name: 'AnalysisResult' })
    await analysisResultStub.vm.$emit('feedback-submitted', true)
    await flushPromises()

    expect(vi.mocked(analysisApiModule.analysisApi.getRecent).mock.calls.length).toBeGreaterThan(callsBefore)
    // result.value.useful이 in-place 업데이트 됐는지 검증
    expect((wrapper.vm as unknown as { result: { useful: boolean } }).result.useful).toBe(true)
  })
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
