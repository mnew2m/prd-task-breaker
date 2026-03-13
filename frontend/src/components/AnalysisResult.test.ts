import { describe, it, expect } from 'vitest'
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

  it('passes correct props to child components', () => {
    const wrapper = shallowMount(AnalysisResult, { props: { result: mockResult } })
    const featureList = wrapper.findComponent({ name: 'FeatureList' })
    expect(featureList.props('features')).toEqual(mockResult.features)
  })
})
