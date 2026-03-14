import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import AnalysisResult from './AnalysisResult.vue'
import type { PrdAnalysisResponse } from '../types/analysis'

const mockResult: PrdAnalysisResponse = {
  id: 42,
  features: [{ name: 'F1', description: 'desc', priority: 'HIGH', notes: null }],
  userStories: [{ role: 'user', action: 'do', benefit: 'get', acceptanceCriteria: [], notes: null }],
  todos: [{ task: 'T1', category: 'BE', priority: 'HIGH', estimatedEffort: '1h', notes: null }],
  apiDrafts: [{ method: 'GET', path: '/api/v1/test', description: 'd', requestBody: null, responseBody: null, notes: null }],
  dbDrafts: [{ tableName: 'users', columns: ['id'], notes: null }],
  testChecklist: [{ item: 'test', category: 'unit', uncertain: false }],
  releaseChecklist: [{ item: 'deploy', category: 'infra', uncertain: false }],
  uncertainItems: ['unclear item'],
  readmeDraft: '# README Draft',
  createdAt: '2026-03-13T00:00:00',
  useful: null,
}

describe('AnalysisResult', () => {
  it('displays result ID', () => {
    const wrapper = shallowMount(AnalysisResult, { props: { result: mockResult } })
    expect(wrapper.text()).toContain('42')
  })

  it('renders README draft section when readmeDraft is set', () => {
    const wrapper = shallowMount(AnalysisResult, { props: { result: mockResult } })
    expect(wrapper.find('.readme-content').exists()).toBe(true)
    expect(wrapper.find('.readme-content').text()).toContain('# README Draft')
  })

  it('hides README section when readmeDraft is null', () => {
    const wrapper = shallowMount(AnalysisResult, {
      props: { result: { ...mockResult, readmeDraft: null } },
    })
    expect(wrapper.find('.readme-section').exists()).toBe(false)
  })

  it('renders all 8 section components', () => {
    const wrapper = shallowMount(AnalysisResult, { props: { result: mockResult } })
    const html = wrapper.html()
    expect(html).toContain('feature-list-stub')
    expect(html).toContain('user-stories-stub')
    expect(html).toContain('todo-breakdown-stub')
    expect(html).toContain('api-draft-stub')
    expect(html).toContain('db-draft-stub')
    expect(html).toContain('test-checklist-stub')
    expect(html).toContain('release-checklist-stub')
    expect(html).toContain('uncertain-items-stub')
  })

  it('passes correct props to FeatureList', () => {
    const wrapper = shallowMount(AnalysisResult, { props: { result: mockResult } })
    const featureList = wrapper.findComponent({ name: 'FeatureList' })
    expect(featureList.props('features')).toEqual(mockResult.features)
  })

  it('renders 순서변경 button in header', () => {
    const wrapper = shallowMount(AnalysisResult, { props: { result: mockResult } })
    expect(wrapper.find('.reorder-btn').exists()).toBe(true)
    expect(wrapper.find('.reorder-btn').text()).toContain('순서변경')
  })

  it('opens reorder modal when 순서변경 button is clicked', async () => {
    const wrapper = shallowMount(AnalysisResult, { props: { result: mockResult } })
    const modal = wrapper.findComponent({ name: 'SectionReorderModal' })
    expect(modal.props('isOpen')).toBe(false)
    await wrapper.find('.reorder-btn').trigger('click')
    expect(modal.props('isOpen')).toBe(true)
  })

  it('renders result-notice disclaimer', () => {
    const wrapper = shallowMount(AnalysisResult, { props: { result: mockResult } })
    expect(wrapper.find('.result-notice').exists()).toBe(true)
    expect(wrapper.find('.result-notice').text()).toContain('AI가 PRD에서')
  })

  it('renders copy button when readmeDraft is set', () => {
    const wrapper = shallowMount(AnalysisResult, { props: { result: mockResult } })
    expect(wrapper.find('.copy-btn').exists()).toBe(true)
  })

  it('hides copy button when readmeDraft is null', () => {
    const wrapper = shallowMount(AnalysisResult, {
      props: { result: { ...mockResult, readmeDraft: null } },
    })
    expect(wrapper.find('.copy-btn').exists()).toBe(false)
  })

  it('renders FeedbackSection component', () => {
    const wrapper = shallowMount(AnalysisResult, { props: { result: mockResult } })
    expect(wrapper.findComponent({ name: 'FeedbackSection' }).exists()).toBe(true)
  })

  it('clicking copy button calls clipboard.writeText with readmeDraft', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    const wrapper = shallowMount(AnalysisResult, { props: { result: mockResult } })
    await wrapper.find('.copy-btn').trigger('click')
    expect(writeText).toHaveBeenCalledWith('# README Draft')
  })

  it('applies new section order when reorder modal emits apply', async () => {
    const wrapper = shallowMount(AnalysisResult, { props: { result: mockResult } })
    const modal = wrapper.findComponent({ name: 'SectionReorderModal' })

    const newOrder = [
      'todos', 'features', 'userStories', 'apiDrafts',
      'dbDrafts', 'testChecklist', 'releaseChecklist', 'uncertainItems',
    ]
    await modal.vm.$emit('apply', newOrder)

    // 첫 번째 렌더링된 섹션 컴포넌트가 TodoBreakdown이어야 함
    const firstSection = wrapper.find('.sections-grid').element.firstElementChild
    expect(firstSection?.tagName.toLowerCase()).toContain('todo')
  })
})
