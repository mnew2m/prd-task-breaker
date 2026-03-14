import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ReleaseChecklist from './ReleaseChecklist.vue'

describe('ReleaseChecklist', () => {
  it('shows empty state when items is empty', () => {
    const wrapper = shallowMount(ReleaseChecklist, { props: { items: [] } })
    expect(wrapper.text()).toContain('항목 없음')
  })

  it('renders item text and category', () => {
    const wrapper = shallowMount(ReleaseChecklist, {
      props: {
        items: [{ item: '스테이징 배포 확인', category: 'deploy', uncertain: false }],
      },
    })
    expect(wrapper.text()).toContain('스테이징 배포 확인')
    expect(wrapper.text()).toContain('deploy')
  })

  it('displays item count in title', () => {
    const wrapper = shallowMount(ReleaseChecklist, {
      props: {
        items: [
          { item: 'A', category: 'deploy', uncertain: false },
          { item: 'B', category: 'db', uncertain: false },
          { item: 'C', category: 'monitor', uncertain: false },
        ],
      },
    })
    expect(wrapper.text()).toContain('3')
  })
})
