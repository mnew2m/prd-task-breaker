<template>
  <div
    v-if="isOpen"
    class="reorder-overlay"
    @click.self="emit('close')"
    @keydown.escape="emit('close')"
  >
    <div
      ref="dialogRef"
      class="reorder-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reorder-dialog-title"
      tabindex="-1"
      @keydown="onKeydown"
    >
      <div class="reorder-header">
        <h3 id="reorder-dialog-title">섹션 순서 변경</h3>
        <button class="close-btn" aria-label="닫기" @click="emit('close')">✕</button>
      </div>

      <p class="reorder-desc">드래그하여 카드 순서를 변경하세요.</p>

      <ul class="section-list" aria-label="섹션 목록">
        <li
          v-for="(key, index) in localOrder"
          :key="key"
          class="section-item"
          :class="{ 'drag-over': dragOverIndex === index, 'dragging': dragIndex === index }"
          draggable="true"
          :aria-label="`${SECTION_LABELS[key]}, 드래그하여 순서 변경`"
          @dragstart="onDragStart(index)"
          @dragover.prevent="onDragOver(index)"
          @drop.prevent="onDrop(index)"
          @dragend="onDragEnd"
        >
          <span class="drag-handle" aria-hidden="true">⠿</span>
          <span class="section-label">{{ SECTION_LABELS[key] }}</span>
          <span class="order-num" aria-hidden="true">{{ index + 1 }}</span>
        </li>
      </ul>

      <div class="reorder-footer">
        <button class="btn-cancel" @click="emit('close')">취소</button>
        <button class="btn-apply" @click="handleApply">적용</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { type GridSectionKey, SECTION_LABELS } from '../utils/sections'

const props = defineProps<{
  isOpen: boolean
  order: GridSectionKey[]
}>()

const emit = defineEmits<{
  close: []
  apply: [order: GridSectionKey[]]
}>()

const dialogRef = ref<HTMLElement | null>(null)
const localOrder = ref<GridSectionKey[]>([...props.order])
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

watch(() => props.isOpen, async (val) => {
  if (val) {
    localOrder.value = [...props.order]
    await nextTick()
    dialogRef.value?.focus()
  }
})

function onDragStart(index: number) {
  dragIndex.value = index
}

function onDragOver(index: number) {
  dragOverIndex.value = index
}

function onDrop(targetIndex: number) {
  if (dragIndex.value === null || dragIndex.value === targetIndex) return
  const newOrder = [...localOrder.value]
  const [moved] = newOrder.splice(dragIndex.value, 1)
  newOrder.splice(targetIndex, 0, moved)
  localOrder.value = newOrder
  dragIndex.value = null
  dragOverIndex.value = null
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

function handleApply() {
  emit('apply', [...localOrder.value])
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (!dialogRef.value) return
  const focusable = Array.from(
    dialogRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  )
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}
</script>

<style scoped>
.reorder-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.reorder-dialog {
  background: white;
  border-radius: 14px;
  width: 380px;
  max-width: 95vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  outline: none;
}

.reorder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f0f0f4;
}

.reorder-header h3 {
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
  padding: 2px 6px;
  line-height: 1;
}

.close-btn:hover { color: #333; }

.reorder-desc {
  font-size: 0.82rem;
  color: #888;
  padding: 10px 20px 0;
  margin: 0;
}

.section-list {
  list-style: none;
  padding: 12px 16px;
  margin: 0;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e8e8ee;
  border-radius: 8px;
  cursor: grab;
  background: white;
  transition: border-color 0.15s, box-shadow 0.15s;
  user-select: none;
}

.section-item:hover { border-color: #6366f1; }
.section-item.dragging { opacity: 0.4; }
.section-item.drag-over {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
  background: #f5f5ff;
}

.drag-handle {
  font-size: 1.1rem;
  color: #bbb;
  cursor: grab;
  flex-shrink: 0;
}

.section-label {
  flex: 1;
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.order-num {
  font-size: 0.75rem;
  color: #bbb;
  flex-shrink: 0;
}

.reorder-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 16px;
  border-top: 1px solid #f0f0f4;
}

.btn-cancel {
  padding: 7px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #555;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-cancel:hover { background: #f5f5f7; }

.btn-apply {
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

.btn-apply:hover { background: #4f46e5; }
</style>
