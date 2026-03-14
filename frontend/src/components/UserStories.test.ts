import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import UserStories from './UserStories.vue'

describe('UserStories', () => {
  it('shows empty state when stories is empty', () => {
    const wrapper = shallowMount(UserStories, { props: { stories: [] } })
    expect(wrapper.text()).toContain('스토리 없음')
  })

  it('renders role, action, benefit', () => {
    const wrapper = shallowMount(UserStories, {
      props: {
        stories: [{
          role: '관리자', action: '로그인', benefit: '서비스에 접근',
          acceptanceCriteria: [], notes: null,
        }],
      },
    })
    expect(wrapper.text()).toContain('관리자')
    expect(wrapper.text()).toContain('로그인')
    expect(wrapper.text()).toContain('서비스에 접근')
  })

  it('renders acceptance criteria when provided', () => {
    const wrapper = shallowMount(UserStories, {
      props: {
        stories: [{
          role: 'user', action: 'act', benefit: 'benefit',
          acceptanceCriteria: ['기준 1', '기준 2'], notes: null,
        }],
      },
    })
    expect(wrapper.find('.criteria').exists()).toBe(true)
    expect(wrapper.text()).toContain('기준 1')
    expect(wrapper.text()).toContain('기준 2')
  })

  it('hides acceptance criteria section when empty', () => {
    const wrapper = shallowMount(UserStories, {
      props: {
        stories: [{ role: 'u', action: 'a', benefit: 'b', acceptanceCriteria: [], notes: null }],
      },
    })
    expect(wrapper.find('.criteria').exists()).toBe(false)
  })

  it('renders notes when provided', () => {
    const wrapper = shallowMount(UserStories, {
      props: {
        stories: [{ role: 'u', action: 'a', benefit: 'b', acceptanceCriteria: [], notes: '비고' }],
      },
    })
    expect(wrapper.find('.notes').exists()).toBe(true)
    expect(wrapper.text()).toContain('비고')
  })
})
