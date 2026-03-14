<template>
  <div
    v-if="isOpen"
    class="confirm-overlay"
    @click.self="emit('cancel')"
    @keydown.escape="emit('cancel')"
  >
    <div
      ref="dialogRef"
      class="confirm-dialog"
      role="alertdialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="descId"
      tabindex="-1"
      @keydown="onKeydown"
    >
      <h3 :id="titleId" class="confirm-title">{{ title }}</h3>
      <p :id="descId" class="confirm-message">{{ message }}</p>
      <div class="confirm-actions">
        <button ref="cancelBtnRef" class="btn-cancel" @click="emit('cancel')">취소</button>
        <button class="btn-confirm" @click="emit('confirm')">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  isOpen: boolean
  title: string
  message: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const cancelBtnRef = ref<HTMLButtonElement | null>(null)
const titleId = 'confirm-dialog-title'
const descId = 'confirm-dialog-desc'

// 모달이 열릴 때 취소 버튼에 포커스
watch(() => props.isOpen, async (val) => {
  if (val) {
    await nextTick()
    cancelBtnRef.value?.focus()
  }
})

// Tab 키 포커스 트랩
function onKeydown(e: KeyboardEvent) {
  if (!dialogRef.value) return
  const focusable = Array.from(
    dialogRef.value.querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])')
  )
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  padding: 1.75rem 2rem;
  width: 360px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  outline: none;
}

.confirm-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.75rem;
}

.confirm-message {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-cancel {
  padding: 0.5rem 1.2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #555;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-cancel:hover {
  background: #f5f5f7;
}

.btn-confirm {
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 8px;
  background: #e74c3c;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-confirm:hover {
  background: #c0392b;
}
</style>
