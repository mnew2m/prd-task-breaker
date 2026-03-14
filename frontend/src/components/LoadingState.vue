<template>
  <div class="loading-state" role="status" aria-live="polite">
    <div class="spinner" aria-hidden="true"></div>
    <p v-if="mode === 'load'">이전 분석 결과를 불러오고 있습니다...</p>
    <p v-else>AI가 PRD를 분석하고 있습니다...</p>
    <template v-if="mode !== 'load'">
      <p class="hint">최대 30초 정도 소요될 수 있습니다</p>
      <button class="cancel-btn" @click="showConfirm = true">
        분석 취소
      </button>
    </template>
  </div>

  <ConfirmDialog
    :is-open="showConfirm"
    title="분석을 취소하시겠습니까?"
    message="취소하면 진행 중인 분석이 중단됩니다. 다시 분석 요청을 해야 합니다."
    @confirm="handleConfirm"
    @cancel="showConfirm = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'

defineProps<{
  mode?: 'analyze' | 'load' | null
}>()

const emit = defineEmits<{ cancel: [] }>()

const showConfirm = ref(false)

function handleConfirm() {
  showConfirm.value = false
  emit('cancel')
}
</script>

<style scoped>
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #1a1a2e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

p {
  color: #555;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.hint {
  font-size: 0.875rem;
  color: #999;
  margin-bottom: 1.5rem;
}

.cancel-btn {
  padding: 0.5rem 1.4rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s;
}

.cancel-btn:hover {
  border-color: #e74c3c;
  color: #e74c3c;
}
</style>
