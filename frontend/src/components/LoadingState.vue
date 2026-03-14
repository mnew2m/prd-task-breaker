<template>
  <div class="loading-state" role="status" aria-live="polite">
    <div class="spinner"></div>
    <p>AI가 PRD를 분석하고 있습니다...</p>
    <p class="hint">최대 30초 정도 소요될 수 있습니다</p>
  </div>
</template>

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
}
</style>
