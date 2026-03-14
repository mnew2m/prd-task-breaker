import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from './ConfirmDialog.vue'

const defaultProps = {
  isOpen: true,
  title: '정말 취소하시겠습니까?',
  message: '이 작업은 되돌릴 수 없습니다.',
}

describe('ConfirmDialog', () => {
  it('renders title and message when open', () => {
    const wrapper = mount(ConfirmDialog, { props: defaultProps })
    expect(wrapper.text()).toContain(defaultProps.title)
    expect(wrapper.text()).toContain(defaultProps.message)
  })

  it('does not render when isOpen is false', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { ...defaultProps, isOpen: false },
    })
    expect(wrapper.find('.confirm-dialog').exists()).toBe(false)
  })

  it('emits confirm when 확인 button clicked', async () => {
    const wrapper = mount(ConfirmDialog, { props: defaultProps })
    await wrapper.find('.btn-confirm').trigger('click')
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('emits cancel when 취소 button clicked', async () => {
    const wrapper = mount(ConfirmDialog, { props: defaultProps })
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('emits cancel when overlay clicked', async () => {
    const wrapper = mount(ConfirmDialog, { props: defaultProps })
    await wrapper.find('.confirm-overlay').trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('emits cancel when Escape key pressed on overlay', async () => {
    const wrapper = mount(ConfirmDialog, { props: defaultProps })
    await wrapper.find('.confirm-overlay').trigger('keydown.escape')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('has correct accessibility attributes', () => {
    const wrapper = mount(ConfirmDialog, { props: defaultProps })
    const dialog = wrapper.find('.confirm-dialog')
    expect(dialog.attributes('role')).toBe('alertdialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBeTruthy()
    expect(dialog.attributes('aria-describedby')).toBeTruthy()
  })
})
