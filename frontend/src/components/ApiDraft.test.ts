import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ApiDraft from './ApiDraft.vue'

describe('ApiDraft', () => {
  it('shows empty state when apiDrafts is empty', () => {
    const wrapper = shallowMount(ApiDraft, { props: { apiDrafts: [] } })
    expect(wrapper.text()).toContain('API 없음')
  })

  it('renders method and path', () => {
    const wrapper = shallowMount(ApiDraft, {
      props: {
        apiDrafts: [{ method: 'GET', path: '/api/v1/users', description: '사용자 목록', requestBody: null, responseBody: null, notes: null }],
      },
    })
    expect(wrapper.text()).toContain('GET')
    expect(wrapper.text()).toContain('/api/v1/users')
  })

  it('applies method-get CSS class for GET', () => {
    const wrapper = shallowMount(ApiDraft, {
      props: {
        apiDrafts: [{ method: 'GET', path: '/', description: 'd', requestBody: null, responseBody: null, notes: null }],
      },
    })
    expect(wrapper.find('.method').classes()).toContain('method-get')
  })

  it('applies method-post CSS class for POST', () => {
    const wrapper = shallowMount(ApiDraft, {
      props: {
        apiDrafts: [{ method: 'POST', path: '/', description: 'd', requestBody: null, responseBody: null, notes: null }],
      },
    })
    expect(wrapper.find('.method').classes()).toContain('method-post')
  })

  it('renders requestBody and responseBody when provided', () => {
    const wrapper = shallowMount(ApiDraft, {
      props: {
        apiDrafts: [{
          method: 'POST', path: '/', description: 'd',
          requestBody: '{"name":"string"}', responseBody: '{"id":1}', notes: null,
        }],
      },
    })
    expect(wrapper.text()).toContain('{"name":"string"}')
    expect(wrapper.text()).toContain('{"id":1}')
  })

  it('hides body sections when null', () => {
    const wrapper = shallowMount(ApiDraft, {
      props: {
        apiDrafts: [{ method: 'GET', path: '/', description: 'd', requestBody: null, responseBody: null, notes: null }],
      },
    })
    expect(wrapper.findAll('.body-section')).toHaveLength(0)
  })
})
