import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import UncertainItems from './UncertainItems.vue'

describe('UncertainItems', () => {
  it('shows empty state when items is empty', () => {
    const wrapper = shallowMount(UncertainItems, { props: { items: [] } })
    expect(wrapper.text()).toContain('불확실 항목 없음')
  })

  it('renders uncertain item text', () => {
    const wrapper = shallowMount(UncertainItems, {
      props: { items: ['성능 목표 불명확', '외부 API 연동 방식 미결'] },
    })
    expect(wrapper.text()).toContain('성능 목표 불명확')
    expect(wrapper.text()).toContain('외부 API 연동 방식 미결')
  })

  it('displays item count in title', () => {
    const wrapper = shallowMount(UncertainItems, {
      props: { items: ['항목1', '항목2', '항목3'] },
    })
    expect(wrapper.text()).toContain('3')
  })

  it('renders list element for each item', () => {
    const wrapper = shallowMount(UncertainItems, {
      props: { items: ['A', 'B'] },
    })
    expect(wrapper.findAll('.uncertain-item')).toHaveLength(2)
  })
})
