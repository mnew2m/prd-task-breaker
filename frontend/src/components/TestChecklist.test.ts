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
})
