import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import TestChecklist from './TestChecklist.vue'

describe('TestChecklist', () => {
  it('shows empty state when items is empty', () => {
    const wrapper = shallowMount(TestChecklist, { props: { items: [] } })
    expect(wrapper.text()).toContain('항목 없음')
  })

  it('renders item text and category', () => {
    const wrapper = shallowMount(TestChecklist, {
      props: {
        items: [{ item: '로그인 단위 테스트', category: 'unit', uncertain: false }],
      },
    })
    expect(wrapper.text()).toContain('로그인 단위 테스트')
    expect(wrapper.text()).toContain('unit')
  })

  it('shows uncertain marker when uncertain is true', () => {
    const wrapper = shallowMount(TestChecklist, {
      props: { items: [{ item: '불명확 항목', category: 'e2e', uncertain: true }] },
    })
    expect(wrapper.find('.uncertain').exists()).toBe(true)
  })

  it('hides uncertain marker when uncertain is false', () => {
    const wrapper = shallowMount(TestChecklist, {
      props: { items: [{ item: '명확 항목', category: 'unit', uncertain: false }] },
    })
    expect(wrapper.find('.uncertain').exists()).toBe(false)
  })

  it('displays item count in title', () => {
    const wrapper = shallowMount(TestChecklist, {
      props: {
        items: [
          { item: 'A', category: 'unit', uncertain: false },
          { item: 'B', category: 'integration', uncertain: false },
        ],
      },
    })
    expect(wrapper.text()).toContain('2')
  })

  it('collapsed: true 일 때 section-collapsed 클래스 적용', () => {
    const wrapper = shallowMount(TestChecklist, { props: { items: [], collapsed: true } })
    expect(wrapper.find('.section-card').classes()).toContain('section-collapsed')
  })

  it('section-title 클릭 시 toggle-collapse emit', async () => {
    const wrapper = shallowMount(TestChecklist, { props: { items: [] } })
    await wrapper.find('.section-title').trigger('click')
    expect(wrapper.emitted('toggle-collapse')).toBeTruthy()
  })
})
