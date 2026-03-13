<template>
  <div class="pdf-export">
    <button class="pdf-btn" @click="openModal">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      PDF 저장
    </button>

    <!-- Modal overlay -->
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>PDF 내보내기</h3>
          <button class="close-btn" @click="closeModal" aria-label="닫기">✕</button>
        </div>

        <div class="modal-body">
          <p class="modal-desc">PDF에 포함할 섹션을 선택하세요.</p>

          <div class="select-all-row">
            <label class="checkbox-label">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleAll"
              />
              <span class="checkbox-text bold">전체 선택</span>
            </label>
          </div>

          <div class="section-list">
            <label
              v-for="key in availableSections"
              :key="key"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="key"
                v-model="selected"
              />
              <span class="checkbox-text">{{ SECTION_LABELS[key] }}</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="closeModal">취소</button>
          <button
            class="download-btn"
            :disabled="selected.length === 0 || isGenerating"
            @click="handleDownload"
          >
            <span v-if="isGenerating">생성 중...</span>
            <span v-else>다운로드</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PrdAnalysisResponse } from '../types/analysis'
import { usePdfExport, ALL_SECTIONS, SECTION_LABELS } from '../composables/usePdfExport'
import type { SectionKey } from '../composables/usePdfExport'

const props = defineProps<{ result: PrdAnalysisResponse }>()

const isOpen = ref(false)
const selected = ref<SectionKey[]>([...ALL_SECTIONS])
const { generatePdf, isGenerating } = usePdfExport()

// Only show sections that have data
const availableSections = computed<SectionKey[]>(() =>
  ALL_SECTIONS.filter((key) => {
    const val = props.result[key as keyof PrdAnalysisResponse]
    if (val === null || val === undefined) return false
    if (Array.isArray(val)) return val.length > 0
    if (typeof val === 'string') return val.length > 0
    return true
  }),
)

const isAllSelected = computed(
  () => selected.value.length === availableSections.value.length,
)

const isIndeterminate = computed(
  () => selected.value.length > 0 && !isAllSelected.value,
)

function openModal() {
  // Reset to all available sections
  selected.value = [...availableSections.value]
  isOpen.value = true
}

function closeModal() {
  if (!isGenerating.value) isOpen.value = false
}

function toggleAll() {
  if (isAllSelected.value) {
    selected.value = []
  } else {
    selected.value = [...availableSections.value]
  }
}

async function handleDownload() {
  await generatePdf(props.result, selected.value)
  isOpen.value = false
}
</script>

<style scoped>
.pdf-export {
  display: inline-block;
}

.pdf-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.pdf-btn:hover {
  background: #4f46e5;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 14px;
  width: 360px;
  max-width: 95vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f0f0f4;
}

.modal-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: #888;
  cursor: pointer;
  line-height: 1;
  padding: 2px 6px;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 16px 20px;
}

.modal-desc {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 12px;
}

.select-all-row {
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f4;
}

.section-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #333;
}

.checkbox-label input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: #6366f1;
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox-text.bold {
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 16px;
  border-top: 1px solid #f0f0f4;
}

.cancel-btn {
  padding: 7px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #555;
  font-size: 0.875rem;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #f5f5f7;
}

.download-btn {
  padding: 7px 20px;
  border: none;
  border-radius: 8px;
  background: #6366f1;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.download-btn:hover:not(:disabled) {
  background: #4f46e5;
}

.download-btn:disabled {
  background: #c7c7d6;
  cursor: not-allowed;
}
</style>
