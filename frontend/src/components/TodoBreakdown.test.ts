import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import TodoBreakdown from './TodoBreakdown.vue'

describe('TodoBreakdown', () => {
  it('shows empty state when todos is empty', () => {
    const wrapper = shallowMount(TodoBreakdown, { props: { todos: [] } })
    expect(wrapper.text()).toContain('TODO 없음')
  })

  it('renders task name and category', () => {
    const wrapper = shallowMount(TodoBreakdown, {
      props: {
        todos: [{ task: 'API 구현', category: 'BE', priority: 'HIGH', estimatedEffort: '2d', notes: null }],
      },
    })
    expect(wrapper.text()).toContain('API 구현')
    expect(wrapper.text()).toContain('BE')
  })

  it('renders priority badge', () => {
    const wrapper = shallowMount(TodoBreakdown, {
      props: {
        todos: [{ task: 'T', category: 'FE', priority: 'MEDIUM', estimatedEffort: null!, notes: null }],
      },
    })
    expect(wrapper.find('.badge').exists()).toBe(true)
  })

  it('renders estimated effort when provided', () => {
    const wrapper = shallowMount(TodoBreakdown, {
      props: {
        todos: [{ task: 'T', category: 'FE', priority: 'MEDIUM', estimatedEffort: '3h', notes: null }],
      },
    })
    expect(wrapper.find('.effort').exists()).toBe(true)
    expect(wrapper.text()).toContain('3h')
  })

  it('hides effort element when estimatedEffort is falsy', () => {
    const wrapper = shallowMount(TodoBreakdown, {
      props: {
        todos: [{ task: 'T', category: 'FE', priority: 'LOW', estimatedEffort: null!, notes: null }],
      },
    })
    expect(wrapper.find('.effort').exists()).toBe(false)
  })

  it('renders notes when provided', () => {
    const wrapper = shallowMount(TodoBreakdown, {
      props: {
        todos: [{ task: 'T', category: 'BE', priority: 'HIGH', estimatedEffort: '1d', notes: '주의사항' }],
      },
    })
    expect(wrapper.find('.notes').exists()).toBe(true)
    expect(wrapper.text()).toContain('주의사항')
  })

  it('collapsed: true 일 때 section-collapsed 클래스 적용', () => {
    const wrapper = shallowMount(TodoBreakdown, { props: { todos: [], collapsed: true } })
    expect(wrapper.find('.section-card').classes()).toContain('section-collapsed')
  })

  it('section-title 클릭 시 toggle-collapse emit', async () => {
    const wrapper = shallowMount(TodoBreakdown, { props: { todos: [] } })
    await wrapper.find('.section-title').trigger('click')
    expect(wrapper.emitted('toggle-collapse')).toBeTruthy()
  })
})
