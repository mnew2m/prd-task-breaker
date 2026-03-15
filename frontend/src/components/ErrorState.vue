<template>
  <div class="error-state" role="alert">
    <div class="error-icon">⚠️</div>
    <h3>오류가 발생했습니다</h3>
    <p class="error-message">{{ message }}</p>
    <p v-if="hint" class="error-hint">💡 {{ hint }}</p>
    <button @click="emit('retry')"><RefreshCw :size="14" /> 다시 시도</button>
  </div>
</template>

<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
defineProps<{ message: string; hint?: string }>()
const emit = defineEmits<{ retry: [] }>()
</script>

<style scoped>
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

h3 {
  color: #e74c3c;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #666;
  margin-bottom: 0.5rem;
}

.error-hint {
  font-size: 0.875rem;
  color: #888;
  background: #fef9ec;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  display: inline-block;
  margin-bottom: 1.5rem;
}

button {
  padding: 0.6rem 1.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

button:hover {
  background: #c0392b;
}
</style>
