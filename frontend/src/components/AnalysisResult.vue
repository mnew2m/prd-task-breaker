<template>
  <div class="analysis-result">
    <div class="result-header">
      <h2><BrainCircuit :size="22" /> 분석 결과</h2>
      <div class="result-header-right">
        <span class="result-id">ID: {{ result.id }}</span>
        <button class="reorder-btn" @click="isReorderOpen = true" aria-label="섹션 순서 변경">
          <GripVertical :size="15" /> 순서변경
        </button>
        <PdfExportButton :result="result" :section-order="sectionOrder" />
      </div>
    </div>

    <p class="result-notice">AI가 PRD에서 핵심 항목을 추출했습니다. PRD가 복잡한 경우 중요도 높은 항목 위주로 요약될 수 있습니다.</p>

    <div class="sections-grid">
      <component
        v-for="key in sectionOrder"
        :key="key"
        :is="SECTION_COMPONENTS[key]"
        v-bind="getSectionProps(key)"
      />
    </div>

    <div v-if="result.readmeDraft" class="readme-section">
      <div class="readme-header">
        <h3><FileText :size="18" /> README 초안</h3>
        <button class="copy-btn" @click="copyReadme" aria-label="README 초안 복사">
          <Copy :size="14" /> 복사
        </button>
      </div>
      <pre class="readme-content">{{ result.readmeDraft }}</pre>
    </div>

    <div class="feedback-section">
      <p class="feedback-label">이 분석이 유용했나요?</p>
      <div class="feedback-buttons">
        <button
          class="feedback-btn"
          :class="{ selected: feedbackValue === true, submitted: feedbackSubmitted }"
          :disabled="feedbackSubmitted || isFeedbackSubmitting"
          aria-label="유용함"
          @click="submitFeedback(true)"
        >👍 유용함</button>
        <button
          class="feedback-btn"
          :class="{ selected: feedbackValue === false, submitted: feedbackSubmitted }"
          :disabled="feedbackSubmitted || isFeedbackSubmitting"
          aria-label="유용하지 않음"
          @click="submitFeedback(false)"
        >👎 아쉬움</button>
      </div>
      <p v-if="feedbackSubmitted" class="feedback-done">피드백이 저장되었습니다. 감사합니다!</p>
    </div>

    <SectionReorderModal
      :is-open="isReorderOpen"
      :order="sectionOrder"
      @close="isReorderOpen = false"
      @apply="onApplyOrder"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, type Component } from 'vue'
import { analysisApi } from '../api/analysisApi'
import type { PrdAnalysisResponse } from '../types/analysis'
import { BrainCircuit, Copy, FileText, GripVertical } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'
import FeatureList from './FeatureList.vue'
import UserStories from './UserStories.vue'
import TodoBreakdown from './TodoBreakdown.vue'
import ApiDraft from './ApiDraft.vue'
import DbDraft from './DbDraft.vue'
import TestChecklist from './TestChecklist.vue'
import ReleaseChecklist from './ReleaseChecklist.vue'
import UncertainItems from './UncertainItems.vue'
import PdfExportButton from './PdfExportButton.vue'
import SectionReorderModal from './SectionReorderModal.vue'
import { type GridSectionKey, DEFAULT_SECTION_ORDER } from '../utils/sections'

const props = defineProps<{ result: PrdAnalysisResponse }>()

const DEFAULT_ORDER: GridSectionKey[] = DEFAULT_SECTION_ORDER

const SECTION_COMPONENTS: Record<GridSectionKey, Component> = {
  features: FeatureList,
  userStories: UserStories,
  todos: TodoBreakdown,
  apiDrafts: ApiDraft,
  dbDrafts: DbDraft,
  testChecklist: TestChecklist,
  releaseChecklist: ReleaseChecklist,
  uncertainItems: UncertainItems,
}

function getSectionProps(key: GridSectionKey): Record<string, unknown> {
  const r = props.result
  switch (key) {
    case 'features':       return { features: r.features }
    case 'userStories':    return { stories: r.userStories }
    case 'todos':          return { todos: r.todos }
    case 'apiDrafts':      return { apiDrafts: r.apiDrafts }
    case 'dbDrafts':       return { dbDrafts: r.dbDrafts }
    case 'testChecklist':  return { items: r.testChecklist }
    case 'releaseChecklist': return { items: r.releaseChecklist }
    case 'uncertainItems': return { items: r.uncertainItems }
    default: return {}
  }
}

const { show: showToast } = useToast()

const sectionOrder = ref<GridSectionKey[]>([...DEFAULT_ORDER])
const isReorderOpen = ref(false)

function onApplyOrder(newOrder: GridSectionKey[]) {
  sectionOrder.value = newOrder
}

// 피드백: props.result.useful이 이미 있으면 이전 피드백 표시
const feedbackValue = ref<boolean | null>(props.result.useful ?? null)
const feedbackSubmitted = ref(props.result.useful !== null && props.result.useful !== undefined)
const isFeedbackSubmitting = ref(false)

async function submitFeedback(useful: boolean) {
  if (feedbackSubmitted.value || isFeedbackSubmitting.value) return
  isFeedbackSubmitting.value = true
  try {
    await analysisApi.submitFeedback(props.result.id, useful)
    feedbackValue.value = useful
    feedbackSubmitted.value = true
    showToast('피드백이 저장되었습니다. 감사합니다!')
  } catch {
    showToast('피드백 저장에 실패했습니다', 'error')
  } finally {
    isFeedbackSubmitting.value = false
  }
}

async function copyReadme() {
  if (!props.result.readmeDraft) return
  await navigator.clipboard.writeText(props.result.readmeDraft)
  showToast('클립보드에 복사되었습니다')
}
</script>

<style scoped>
.analysis-result {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.result-header h2 {
  font-size: 1.5rem;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.result-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-id {
  font-size: 0.875rem;
  color: #999;
}

.reorder-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
}

.reorder-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(500px, 100%), 1fr));
  gap: 1.5rem;
}

.result-notice {
  font-size: 0.78rem;
  color: #aaa;
  margin-top: -0.5rem;
}

.readme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.readme-header h3 {
  margin-bottom: 0;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.78rem;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.copy-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
}

.readme-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.readme-section h3 {
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.feedback-section {
  background: white;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.feedback-label {
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;
}

.feedback-buttons {
  display: flex;
  gap: 0.75rem;
}

.feedback-btn {
  padding: 0.5rem 1.25rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s;
  color: #555;
}

.feedback-btn:hover:not(:disabled) {
  border-color: #6366f1;
  color: #6366f1;
}

.feedback-btn.selected {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

.feedback-btn:disabled {
  cursor: default;
  opacity: 0.7;
}

.feedback-done {
  font-size: 0.8rem;
  color: #22c55e;
}

.readme-content {
  background: #f8f8f8;
  padding: 1rem;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
