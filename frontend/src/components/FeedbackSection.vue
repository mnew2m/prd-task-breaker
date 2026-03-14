<template>
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
        aria-label="아쉬움"
        @click="submitFeedback(false)"
      >👎 아쉬움</button>
    </div>
    <p v-if="feedbackSubmitted" class="feedback-done">피드백이 저장되었습니다. 감사합니다!</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { analysisApi } from '../api/analysisApi'
import type { PrdAnalysisResponse } from '../types/analysis'
import { useToast } from '../composables/useToast'

const props = defineProps<{ result: PrdAnalysisResponse }>()

const emit = defineEmits<{ 'feedback-submitted': [useful: boolean] }>()

const { show: showToast } = useToast()

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
    emit('feedback-submitted', useful)
    showToast('피드백이 저장되었습니다. 감사합니다!')
  } catch {
    showToast('피드백 저장에 실패했습니다', 'error')
  } finally {
    isFeedbackSubmitting.value = false
  }
}
</script>

<style scoped>
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
</style>
