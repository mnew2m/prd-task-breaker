import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import PdfExportButton from './PdfExportButton.vue'
import type { PrdAnalysisResponse } from '../types/analysis'

const mockGeneratePdf = vi.fn()
const mockIsGenerating = ref(false)

vi.mock('../composables/usePdfExport', () => ({
  usePdfExport: () => ({ generatePdf: mockGeneratePdf, isGenerating: mockIsGenerating }),
  ALL_SECTIONS: ['features', 'userStories', 'todos'],
  SECTION_LABELS: {
    features: '기능 목록',
    userStories: '유저 스토리',
    todos: 'TODO',
  },
}))

const makeResult = (overrides: Partial<PrdAnalysisResponse> = {}): PrdAnalysisResponse => ({
  id: 1,
  features: [{ name: 'F1', description: 'desc', priority: 'HIGH', notes: null }],
  userStories: [],
  todos: [{ task: 'T1', category: 'BE', priority: 'LOW', estimatedEffort: '1d', notes: null }],
  apiDrafts: [],
  dbDrafts: [],
  testChecklist: [],
  releaseChecklist: [],
  uncertainItems: [],
  readmeDraft: null,
  createdAt: '2026-01-01T00:00:00',
  ...overrides,
})

describe('PdfExportButton', () => {
  beforeEach(() => {
    mockGeneratePdf.mockResolvedValue(undefined)
    mockIsGenerating.value = false
  })

  it('"PDF 저장" 버튼이 렌더링된다', () => {
    const wrapper = mount(PdfExportButton, { props: { result: makeResult() } })
    expect(wrapper.find('.pdf-btn').text()).toContain('PDF 저장')
  })

  it('PDF 저장 버튼 클릭 시 모달이 열린다', async () => {
    const wrapper = mount(PdfExportButton, { props: { result: makeResult() } })
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
    await wrapper.find('.pdf-btn').trigger('click')
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
  })

  it('닫기(✕) 버튼 클릭 시 모달이 닫힌다', async () => {
    const wrapper = mount(PdfExportButton, { props: { result: makeResult() } })
    await wrapper.find('.pdf-btn').trigger('click')
    await wrapper.find('.close-btn').trigger('click')
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('취소 버튼 클릭 시 모달이 닫힌다', async () => {
    const wrapper = mount(PdfExportButton, { props: { result: makeResult() } })
    await wrapper.find('.pdf-btn').trigger('click')
    await wrapper.find('.cancel-btn').trigger('click')
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('데이터가 있는 섹션만 체크박스로 표시된다', async () => {
    // features와 todos만 데이터 있음 (userStories는 빈 배열)
    const wrapper = mount(PdfExportButton, { props: { result: makeResult() } })
    await wrapper.find('.pdf-btn').trigger('click')
    const labels = wrapper.findAll('.section-list .checkbox-label')
    expect(labels).toHaveLength(2)
  })

  it('섹션을 모두 해제하면 다운로드 버튼이 비활성화된다', async () => {
    const wrapper = mount(PdfExportButton, { props: { result: makeResult() } })
    await wrapper.find('.pdf-btn').trigger('click')
    // 전체 선택 체크박스로 전체 해제
    const selectAll = wrapper.find('.select-all-row input[type="checkbox"]')
    await selectAll.trigger('change')
    expect(wrapper.find('.download-btn').attributes('disabled')).toBeDefined()
  })

  it('다운로드 버튼 클릭 시 generatePdf가 호출된다', async () => {
    const result = makeResult()
    const wrapper = mount(PdfExportButton, { props: { result } })
    await wrapper.find('.pdf-btn').trigger('click')
    await wrapper.find('.download-btn').trigger('click')
    expect(mockGeneratePdf).toHaveBeenCalledOnce()
    expect(mockGeneratePdf).toHaveBeenCalledWith(result, expect.any(Array))
  })

  it('생성 중(isGenerating)에는 닫기 버튼을 눌러도 모달이 닫히지 않는다', async () => {
    mockIsGenerating.value = true
    const wrapper = mount(PdfExportButton, { props: { result: makeResult() } })
    await wrapper.find('.pdf-btn').trigger('click')
    await wrapper.find('.close-btn').trigger('click')
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
  })

  it('모달 오버레이 클릭 시 모달이 닫힌다', async () => {
    const wrapper = mount(PdfExportButton, { props: { result: makeResult() } })
    await wrapper.find('.pdf-btn').trigger('click')
    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })
})
