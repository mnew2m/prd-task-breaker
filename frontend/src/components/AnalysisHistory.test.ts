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

/** 패널을 열어주는 헬퍼 */
async function openPanel(wrapper: ReturnType<typeof mount>) {
  await wrapper.find('.history-toggle').trigger('click')
}

describe('AnalysisHistory', () => {
  // ── toggle (collapse / expand) ────────────────────────────────────────────

  it('starts collapsed: history-body is not rendered', () => {
    const wrapper = mount(AnalysisHistory, { props: { recentList: [] } })
    expect(wrapper.find('.history-body').exists()).toBe(false)
  })

  it('clicking toggle renders history-body', async () => {
    const wrapper = mount(AnalysisHistory, { props: { recentList: [] } })
    await openPanel(wrapper)
    expect(wrapper.find('.history-body').exists()).toBe(true)
  })

  it('clicking toggle a second time hides history-body again', async () => {
    const wrapper = mount(AnalysisHistory, { props: { recentList: [] } })
    await openPanel(wrapper)
    await wrapper.find('.history-toggle').trigger('click')
    expect(wrapper.find('.history-body').exists()).toBe(false)
  })

  it('toggle button renders title text', () => {
    const wrapper = mount(AnalysisHistory, { props: { recentList: [] } })
    expect(wrapper.find('.history-toggle').text()).toContain('분석 히스토리')
  })

  // ── empty state ───────────────────────────────────────────────────────────

  it('shows empty-state message when open and recentList is empty', async () => {
    const wrapper = mount(AnalysisHistory, { props: { recentList: [] } })
    await openPanel(wrapper)
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-state').text()).toContain('아직 분석 기록이 없습니다')
  })

  it('does not render history-list when open and recentList is empty', async () => {
    const wrapper = mount(AnalysisHistory, { props: { recentList: [] } })
    await openPanel(wrapper)
    expect(wrapper.find('.history-list').exists()).toBe(false)
  })

  // ── list rendering ────────────────────────────────────────────────────────

  it('does not show empty-state when open and recentList has items', async () => {
    const wrapper = mount(AnalysisHistory, { props: { recentList: [makeItem(1)] } })
    await openPanel(wrapper)
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  it('renders up to 3 cards even if recentList has more', async () => {
    const list = [makeItem(1), makeItem(2), makeItem(3), makeItem(4), makeItem(5)]
    const wrapper = mount(AnalysisHistory, { props: { recentList: list } })
    await openPanel(wrapper)
    expect(wrapper.findAll('.history-card')).toHaveLength(3)
  })

  it('renders exactly 3 cards when recentList has 3 items', async () => {
    const wrapper = mount(AnalysisHistory, {
      props: { recentList: [makeItem(1), makeItem(2), makeItem(3)] },
    })
    await openPanel(wrapper)
    expect(wrapper.findAll('.history-card')).toHaveLength(3)
  })

  it('renders fewer than 3 cards when recentList has fewer items', async () => {
    const wrapper = mount(AnalysisHistory, {
      props: { recentList: [makeItem(1)] },
    })
    await openPanel(wrapper)
    expect(wrapper.findAll('.history-card')).toHaveLength(1)
  })

  it('displays item id in card', async () => {
    const wrapper = mount(AnalysisHistory, { props: { recentList: [makeItem(42)] } })
    await openPanel(wrapper)
    expect(wrapper.find('.card-id').text()).toContain('42')
  })

  it('displays feature count in card', async () => {
    const wrapper = mount(AnalysisHistory, { props: { recentList: [makeItem(1, 5)] } })
    await openPanel(wrapper)
    expect(wrapper.find('.card-count').text()).toContain('5')
  })

  it('displays date in YYYY-MM-DD HH:mm format', async () => {
    const item = { ...makeItem(1), createdAt: '2026-03-13T10:05:00' }
    const wrapper = mount(AnalysisHistory, { props: { recentList: [item] } })
    await openPanel(wrapper)
    expect(wrapper.find('.card-date').text()).toBe('2026-03-13 10:05')
  })

  it('falls back to raw string for invalid date', async () => {
    const item = { ...makeItem(1), createdAt: 'not-a-date' }
    const wrapper = mount(AnalysisHistory, { props: { recentList: [item] } })
    await openPanel(wrapper)
    expect(wrapper.find('.card-date').text()).toBe('not-a-date')
  })

  // ── select event ──────────────────────────────────────────────────────────

  it('emits select event with correct id when card is clicked', async () => {
    const wrapper = mount(AnalysisHistory, { props: { recentList: [makeItem(7)] } })
    await openPanel(wrapper)
    await wrapper.find('.history-card').trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual([7])
  })

  it('emits select with the correct id for the second card', async () => {
    const wrapper = mount(AnalysisHistory, {
      props: { recentList: [makeItem(10), makeItem(20)] },
    })
    await openPanel(wrapper)
    const cards = wrapper.findAll('.history-card')
    await cards[1].trigger('click')
    expect(wrapper.emitted('select')![0]).toEqual([20])
  })
})
