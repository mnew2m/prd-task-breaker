import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SectionReorderModal from './SectionReorderModal.vue'
import { type GridSectionKey } from '../utils/sections'

const DEFAULT_ORDER: GridSectionKey[] = [
  'features', 'userStories', 'todos', 'apiDrafts',
  'dbDrafts', 'testChecklist', 'releaseChecklist', 'uncertainItems',
]

describe('SectionReorderModal', () => {
  it('does not render when isOpen is false', () => {
    const wrapper = mount(SectionReorderModal, {
      props: { isOpen: false, order: DEFAULT_ORDER },
    })
    expect(wrapper.find('.reorder-overlay').exists()).toBe(false)
  })

  it('renders all 8 section items when open', () => {
    const wrapper = mount(SectionReorderModal, {
      props: { isOpen: true, order: DEFAULT_ORDER },
    })
    expect(wrapper.findAll('.section-item')).toHaveLength(8)
  })

  it('renders section labels in correct order', () => {
    const wrapper = mount(SectionReorderModal, {
      props: { isOpen: true, order: DEFAULT_ORDER },
    })
    const labels = wrapper.findAll('.section-label').map(el => el.text())
    expect(labels[0]).toBe('기능 목록')
    expect(labels[1]).toBe('유저 스토리')
  })

  it('emits close when overlay clicked', async () => {
    const wrapper = mount(SectionReorderModal, {
      props: { isOpen: true, order: DEFAULT_ORDER },
    })
    await wrapper.find('.reorder-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close when 취소 button clicked', async () => {
    const wrapper = mount(SectionReorderModal, {
      props: { isOpen: true, order: DEFAULT_ORDER },
    })
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits apply with current order on 적용 click', async () => {
    const wrapper = mount(SectionReorderModal, {
      props: { isOpen: true, order: DEFAULT_ORDER },
    })
    await wrapper.find('.btn-apply').trigger('click')
    const applyEmit = wrapper.emitted('apply')
    expect(applyEmit).toBeTruthy()
    expect(applyEmit![0][0]).toEqual(DEFAULT_ORDER)
  })

  it('emits apply then close when 적용 clicked', async () => {
    const wrapper = mount(SectionReorderModal, {
      props: { isOpen: true, order: DEFAULT_ORDER },
    })
    await wrapper.find('.btn-apply').trigger('click')
    expect(wrapper.emitted('apply')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('reorders items on drop and emits new order on apply', async () => {
    const wrapper = mount(SectionReorderModal, {
      props: { isOpen: true, order: DEFAULT_ORDER },
    })
    const items = wrapper.findAll('.section-item')

    // Simulate: drag index 0 (features) and drop to index 2 (todos position)
    await items[0].trigger('dragstart')
    await items[2].trigger('dragover')
    await items[2].trigger('drop')

    await wrapper.find('.btn-apply').trigger('click')

    const applyEmit = wrapper.emitted('apply')!
    const newOrder = applyEmit[0][0] as GridSectionKey[]
    // 'features' should now be at index 2
    expect(newOrder[2]).toBe('features')
    expect(newOrder[0]).toBe('userStories')
  })

  it('has correct accessibility attributes on dialog', () => {
    const wrapper = mount(SectionReorderModal, {
      props: { isOpen: true, order: DEFAULT_ORDER },
    })
    const dialog = wrapper.find('.reorder-dialog')
    expect(dialog.attributes('role')).toBe('dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe('reorder-dialog-title')
  })

  it('resets to original order when closed and reopened', async () => {
    const wrapper = mount(SectionReorderModal, {
      props: { isOpen: true, order: DEFAULT_ORDER },
    })
    // Drag to change order
    const items = wrapper.findAll('.section-item')
    await items[0].trigger('dragstart')
    await items[1].trigger('drop')

    // Close without applying
    await wrapper.find('.btn-cancel').trigger('click')

    // Reopen
    await wrapper.setProps({ isOpen: false })
    await wrapper.setProps({ isOpen: true })

    const labels = wrapper.findAll('.section-label').map(el => el.text())
    expect(labels[0]).toBe('기능 목록')
  })
})
