import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import FeatureList from './FeatureList.vue'

describe('FeatureList', () => {
  it('shows empty state when features is empty', () => {
    const wrapper = shallowMount(FeatureList, { props: { features: [] } })
    expect(wrapper.find('.empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('기능 없음')
  })

  it('renders feature name and description', () => {
    const wrapper = shallowMount(FeatureList, {
      props: {
        features: [{ name: '로그인', description: '사용자 인증 기능', priority: 'HIGH', notes: null }],
      },
    })
    expect(wrapper.text()).toContain('로그인')
    expect(wrapper.text()).toContain('사용자 인증 기능')
  })

  it('renders priority badge', () => {
    const wrapper = shallowMount(FeatureList, {
      props: {
        features: [{ name: 'F', description: 'd', priority: 'LOW', notes: null }],
      },
    })
    expect(wrapper.find('.badge').exists()).toBe(true)
    expect(wrapper.text()).toContain('LOW')
  })

  it('renders notes when provided', () => {
    const wrapper = shallowMount(FeatureList, {
      props: {
        features: [{ name: 'F', description: 'd', priority: 'HIGH', notes: '참고사항' }],
      },
    })
    expect(wrapper.find('.notes').exists()).toBe(true)
    expect(wrapper.text()).toContain('참고사항')
  })

  it('hides notes element when notes is null', () => {
    const wrapper = shallowMount(FeatureList, {
      props: {
        features: [{ name: 'F', description: 'd', priority: 'HIGH', notes: null }],
      },
    })
    expect(wrapper.find('.notes').exists()).toBe(false)
  })

  it('displays item count in title', () => {
    const wrapper = shallowMount(FeatureList, {
      props: {
        features: [
          { name: 'A', description: 'd', priority: 'HIGH', notes: null },
          { name: 'B', description: 'd', priority: 'LOW', notes: null },
        ],
      },
    })
    expect(wrapper.text()).toContain('2')
  })

  it('collapsed: true 일 때 section-collapsed 클래스 적용', () => {
    const wrapper = shallowMount(FeatureList, { props: { features: [], collapsed: true } })
    expect(wrapper.find('.section-card').classes()).toContain('section-collapsed')
  })

  it('section-title 클릭 시 toggle-collapse emit', async () => {
    const wrapper = shallowMount(FeatureList, { props: { features: [] } })
    await wrapper.find('.section-title').trigger('click')
    expect(wrapper.emitted('toggle-collapse')).toBeTruthy()
  })
})
