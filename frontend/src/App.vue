<template>
  <div class="app">
    <header class="app-header">
      <h1>PRD Task Breaker</h1>
      <p class="subtitle">PRD를 입력하면 AI가 구조화된 개발 태스크를 생성합니다</p>
    </header>

    <main class="app-main">
      <PrdInput
        :is-loading="isLoading"
        @analyze="analyze"
      />

      <LoadingState v-if="isLoading" />
      <ErrorState v-else-if="error" :message="error" @retry="reset" />
      <AnalysisResult v-else-if="hasResult && result" :result="result" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAnalysis } from './composables/useAnalysis'
import PrdInput from './components/PrdInput.vue'
import AnalysisResult from './components/AnalysisResult.vue'
import LoadingState from './components/LoadingState.vue'
import ErrorState from './components/ErrorState.vue'

const { result, isLoading, error, hasResult, analyze, reset } = useAnalysis()
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #1a1a2e;
  color: white;
  padding: 2rem;
  text-align: center;
}

.app-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  opacity: 0.8;
  font-size: 1rem;
}

.app-main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}
</style>
