<template>
  <div class="error-state">
    <div class="error-icon">⚠️</div>
    <h3>분석 중 오류가 발생했습니다</h3>
    <p>{{ message }}</p>
    <button @click="emit('retry')">다시 시도</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message: string }>()
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

p {
  color: #666;
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
}

button:hover {
  background: #c0392b;
}
</style>
