import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import DbDraft from './DbDraft.vue'

describe('DbDraft', () => {
  it('shows empty state when dbDrafts is empty', () => {
    const wrapper = shallowMount(DbDraft, { props: { dbDrafts: [] } })
    expect(wrapper.text()).toContain('DB 스키마 없음')
  })

  it('renders table name', () => {
    const wrapper = shallowMount(DbDraft, {
      props: {
        dbDrafts: [{ tableName: 'users', columns: ['id BIGINT', 'email VARCHAR(255)'], notes: null }],
      },
    })
    expect(wrapper.text()).toContain('users')
  })

  it('renders all columns', () => {
    const wrapper = shallowMount(DbDraft, {
      props: {
        dbDrafts: [{ tableName: 'orders', columns: ['id BIGINT', 'user_id BIGINT', 'total DECIMAL'], notes: null }],
      },
    })
    expect(wrapper.text()).toContain('id BIGINT')
    expect(wrapper.text()).toContain('user_id BIGINT')
    expect(wrapper.text()).toContain('total DECIMAL')
  })

  it('renders notes when provided', () => {
    const wrapper = shallowMount(DbDraft, {
      props: {
        dbDrafts: [{ tableName: 't', columns: ['id'], notes: '인덱스 필요' }],
      },
    })
    expect(wrapper.find('.notes').exists()).toBe(true)
    expect(wrapper.text()).toContain('인덱스 필요')
  })

  it('hides notes when null', () => {
    const wrapper = shallowMount(DbDraft, {
      props: { dbDrafts: [{ tableName: 't', columns: ['id'], notes: null }] },
    })
    expect(wrapper.find('.notes').exists()).toBe(false)
  })

  it('collapsed: true 일 때 section-collapsed 클래스 적용', () => {
    const wrapper = shallowMount(DbDraft, { props: { dbDrafts: [], collapsed: true } })
    expect(wrapper.find('.section-card').classes()).toContain('section-collapsed')
  })

  it('section-title 클릭 시 toggle-collapse emit', async () => {
    const wrapper = shallowMount(DbDraft, { props: { dbDrafts: [] } })
    await wrapper.find('.section-title').trigger('click')
    expect(wrapper.emitted('toggle-collapse')).toBeTruthy()
  })
})
