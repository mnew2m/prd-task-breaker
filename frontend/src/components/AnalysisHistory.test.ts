import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AnalysisHistory from './AnalysisHistory.vue'
import type { PrdAnalysisResponse } from '../types/analysis'

const makeItem = (id: number, featureCount = 2): PrdAnalysisResponse => ({
  id,
  features: Array.from({ length: featureCount }, (_, i) => ({
    name: `F${i}`,
    description: 'desc',
    priority: 'HIGH',
    notes: null,
  })),
  userStories: [],
  todos: [],
  apiDrafts: [],
  dbDrafts: [],
  testChecklist: [],
  releaseChecklist: [],
  uncertainItems: [],
  readmeDraft: null,
  createdAt: '2026-03-13T10:00:00',
})

describe('AnalysisHistory', () => {
  // ── empty state ───────────────────────────────────────────────────────────

  it('shows empty-state message when recentList is empty', () => {
    const wrapper = mount(AnalysisHistory, { props: { recentList: [] } })
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-state').text()).toContain('아직 분석 기록이 없습니다')
  })

  it('does not render history-list when recentList is empty', () => {
    const wrapper = mount(AnalysisHistory, { props: { recentList: [] } })
    expect(wrapper.find('.history-list').exists()).toBe(false)
  })

  // ── list rendering ────────────────────────────────────────────────────────

  it('does not show empty-state when recentList has items', () => {
    const wrapper = mount(AnalysisHistory, { props: { recentList: [makeItem(1)] } })
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  it('renders one card per item', () => {
    const wrapper = mount(AnalysisHistory, {
      props: { recentList: [makeItem(1), makeItem(2), makeItem(3)] },
    })
    expect(wrapper.findAll('.history-card')).toHaveLength(3)
  })

  it('displays item id in each card', () => {
    const wrapper = mount(AnalysisHistory, {
      props: { recentList: [makeItem(42)] },
    })
    expect(wrapper.find('.card-id').text()).toContain('42')
  })

  it('displays feature count in each card', () => {
    const wrapper = mount(AnalysisHistory, {
      props: { recentList: [makeItem(1, 5)] },
    })
    expect(wrapper.find('.card-count').text()).toContain('5')
  })

  it('displays formatted date in each card', () => {
    const wrapper = mount(AnalysisHistory, {
      props: { recentList: [makeItem(1)] },
    })
    // date should not be empty
    expect(wrapper.find('.card-date').text()).not.toBe('')
  })

  // ── select event ──────────────────────────────────────────────────────────

  it('emits select event with correct id when card is clicked', async () => {
    const wrapper = mount(AnalysisHistory, {
      props: { recentList: [makeItem(7)] },
    })
    await wrapper.find('.history-card').trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual([7])
  })

  it('emits select with the correct id for each card when multiple exist', async () => {
    const wrapper = mount(AnalysisHistory, {
      props: { recentList: [makeItem(10), makeItem(20)] },
    })
    const cards = wrapper.findAll('.history-card')
    await cards[1].trigger('click')
    expect(wrapper.emitted('select')![0]).toEqual([20])
  })

  // ── title ─────────────────────────────────────────────────────────────────

  it('renders section title', () => {
    const wrapper = mount(AnalysisHistory, { props: { recentList: [] } })
    expect(wrapper.find('.history-title').text()).toContain('분석 히스토리')
  })
})
