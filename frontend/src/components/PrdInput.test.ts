import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PrdInput from './PrdInput.vue'

const SHORT = 'a'.repeat(49)
const VALID = 'a'.repeat(50)

describe('PrdInput', () => {
  it('analyze button is disabled when textarea is empty', () => {
    const wrapper = mount(PrdInput, { props: { isLoading: false } })
    expect(wrapper.find('.analyze-btn').attributes('disabled')).toBeDefined()
  })

  it('analyze button is disabled when content is under 50 chars', async () => {
    const wrapper = mount(PrdInput, { props: { isLoading: false } })
    await wrapper.find('textarea').setValue(SHORT)
    expect(wrapper.find('.analyze-btn').attributes('disabled')).toBeDefined()
  })

  it('analyze button is enabled when content is 50+ chars', async () => {
    const wrapper = mount(PrdInput, { props: { isLoading: false } })
    await wrapper.find('textarea').setValue(VALID)
    expect(wrapper.find('.analyze-btn').attributes('disabled')).toBeUndefined()
  })

  it('emits analyze event with content on button click', async () => {
    const wrapper = mount(PrdInput, { props: { isLoading: false } })
    await wrapper.find('textarea').setValue(VALID)
    await wrapper.find('.analyze-btn').trigger('click')
    expect(wrapper.emitted('analyze')).toBeTruthy()
    expect(wrapper.emitted('analyze')![0]).toEqual([VALID])
  })

  it('does not emit analyze when content is too short', async () => {
    const wrapper = mount(PrdInput, { props: { isLoading: false } })
    await wrapper.find('textarea').setValue(SHORT)
    await wrapper.find('.analyze-btn').trigger('click')
    expect(wrapper.emitted('analyze')).toBeFalsy()
  })

  it('shows too-short class when content is between 1 and 49 chars', async () => {
    const wrapper = mount(PrdInput, { props: { isLoading: false } })
    await wrapper.find('textarea').setValue('hi')
    expect(wrapper.find('.char-count').classes()).toContain('too-short')
  })

  it('does not show too-short class when content is 50+ chars', async () => {
    const wrapper = mount(PrdInput, { props: { isLoading: false } })
    await wrapper.find('textarea').setValue(VALID)
    expect(wrapper.find('.char-count').classes()).not.toContain('too-short')
  })

  it('loadSample fills textarea with valid-length content', async () => {
    const wrapper = mount(PrdInput, { props: { isLoading: false } })
    await wrapper.find('.sample-btn').trigger('click')
    const textarea = wrapper.find('textarea').element as HTMLTextAreaElement
    expect(textarea.value.length).toBeGreaterThan(50)
  })

  it('analyze button is disabled when isLoading is true', () => {
    const wrapper = mount(PrdInput, { props: { isLoading: true } })
    expect(wrapper.find('.analyze-btn').attributes('disabled')).toBeDefined()
  })
})
