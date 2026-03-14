import { describe, it, expect, vi, afterEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import FeedbackSection from './FeedbackSection.vue'
import type { PrdAnalysisResponse } from '../types/analysis'
import * as analysisApiModule from '../api/analysisApi'
import { useToast } from '../composables/useToast'

const { toasts } = useToast()

const baseResult: PrdAnalysisResponse = {
  id: 1,
  features: [], userStories: [], todos: [], apiDrafts: [], dbDrafts: [],
  testChecklist: [], releaseChecklist: [], uncertainItems: [],
  readmeDraft: null,
  createdAt: '2026-03-13T00:00:00',
  useful: null,
}

afterEach(() => { toasts.value = [] })

describe('FeedbackSection', () => {
  it('renders two feedback buttons', () => {
    const wrapper = shallowMount(FeedbackSection, { props: { result: baseResult } })
    expect(wrapper.findAll('.feedback-btn')).toHaveLength(2)
  })

  it('buttons are enabled when useful is null (no prior feedback)', () => {
    const wrapper = shallowMount(FeedbackSection, { props: { result: baseResult } })
    wrapper.findAll('.feedback-btn').forEach(btn => {
      expect((btn.element as HTMLButtonElement).disabled).toBe(false)
    })
  })

  it('buttons are disabled when useful is already set (prior feedback)', () => {
    const wrapper = shallowMount(FeedbackSection, {
      props: { result: { ...baseResult, useful: true } },
    })
    wrapper.findAll('.feedback-btn').forEach(btn => {
      expect((btn.element as HTMLButtonElement).disabled).toBe(true)
    })
  })

  it('shows 유용함 button as selected when useful is true', () => {
    const wrapper = shallowMount(FeedbackSection, {
      props: { result: { ...baseResult, useful: true } },
    })
    const btns = wrapper.findAll('.feedback-btn')
    expect(btns[0].classes()).toContain('selected')
    expect(btns[1].classes()).not.toContain('selected')
  })

  it('calls submitFeedback API and disables buttons on success', async () => {
    vi.spyOn(analysisApiModule.analysisApi, 'submitFeedback').mockResolvedValue({
      ...baseResult, useful: true,
    })
    const wrapper = shallowMount(FeedbackSection, { props: { result: baseResult } })
    await wrapper.findAll('.feedback-btn')[0].trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(analysisApiModule.analysisApi.submitFeedback).toHaveBeenCalledWith(1, true)
    wrapper.findAll('.feedback-btn').forEach(btn => {
      expect((btn.element as HTMLButtonElement).disabled).toBe(true)
    })
    expect(wrapper.emitted('feedback-submitted')).toHaveLength(1)
  })

  it('shows error toast when API call fails', async () => {
    vi.spyOn(analysisApiModule.analysisApi, 'submitFeedback').mockRejectedValue(new Error('fail'))
    const wrapper = shallowMount(FeedbackSection, { props: { result: baseResult } })
    await wrapper.findAll('.feedback-btn')[0].trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(toasts.value.some(t => t.type === 'error')).toBe(true)
  })
})
