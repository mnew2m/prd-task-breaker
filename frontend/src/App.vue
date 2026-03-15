<template>
  <div class="app">
    <header class="app-header">
      <div class="header-title">
        <Zap :size="28" color="#6366f1" />
        <h1>PRD Task Breaker</h1>
      </div>
      <p class="subtitle">PRD를 입력하면 AI가 구조화된 개발 태스크를 생성합니다</p>
    </header>

    <button
      v-if="showScrollTop"
      class="scroll-top-btn"
      aria-label="맨 위로"
      @click="scrollToTop"
    >↑</button>

    <Toast />

    <main class="app-main">
      <template v-if="!hasResult">
        <PrdInput
          :is-loading="isLoading"
          @analyze="analyze"
        />
        <LoadingState v-if="isLoading" :mode="loadingMode" @cancel="reset" />
        <ErrorState v-else-if="error" :message="error" :hint="errorHint ?? undefined" @retry="reset" />
        <AnalysisHistory
          :recent-list="recentList"
          @select="loadById"
        />
      </template>

      <template v-else-if="result">
        <div class="result-toolbar">
          <button class="btn-new" @click="reset">+ 새 분석</button>
        </div>
        <AnalysisResult :result="result" @feedback-submitted="onFeedbackSubmitted" />
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useAnalysis } from './composables/useAnalysis'
import { Zap } from 'lucide-vue-next'
import PrdInput from './components/PrdInput.vue'
import AnalysisResult from './components/AnalysisResult.vue'
import LoadingState from './components/LoadingState.vue'
import ErrorState from './components/ErrorState.vue'
import AnalysisHistory from './components/AnalysisHistory.vue'
import Toast from './components/Toast.vue'

const { result, isLoading, loadingMode, error, errorHint, hasResult, recentList, analyze, loadById, loadRecent, reset } = useAnalysis()

const showScrollTop = ref(false)

function onScroll() {
  showScrollTop.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onFeedbackSubmitted(useful: boolean) {
  if (result.value) result.value.useful = useful
  loadRecent()
}

onMounted(() => {
  loadRecent()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
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

.header-title {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}

.app-header h1 {
  font-size: 2rem;
  margin-bottom: 0;
}

.subtitle {
  opacity: 0.8;
  font-size: 1rem;
}

@media (max-width: 1023px) {
  .app-header {
    padding: 1.5rem;
  }

  .app-header h1 {
    font-size: 1.75rem;
  }
}

@media (max-width: 600px) {
  .app-header {
    padding: 1.25rem 1rem;
  }

  .app-header h1 {
    font-size: 1.4rem;
  }

  .subtitle {
    font-size: 0.8rem;
  }
}

.app-main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

@media (max-width: 1023px) {
  .app-main {
    padding: 1.5rem;
  }
}

/* 섹션 타이틀 아이콘 정렬 */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.result-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.btn-new {
  padding: 0.5rem 1.1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-new:hover {
  background: #4f46e5;
}

.scroll-top-btn {
  display: none;
}

@media (max-width: 1023px) {
  .scroll-top-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 1.5rem;
    right: 1.25rem;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #6366f1;
    color: white;
    border: none;
    font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    cursor: pointer;
    z-index: 500;
  }
}
</style>
