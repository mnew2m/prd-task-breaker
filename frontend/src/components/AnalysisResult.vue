<template>
  <div class="analysis-result">
    <div class="result-header">
      <h2>분석 결과</h2>
      <span class="result-id">ID: {{ result.id }}</span>
    </div>

    <div class="sections-grid">
      <FeatureList :features="result.features" />
      <UserStories :stories="result.userStories" />
      <TodoBreakdown :todos="result.todos" />
      <ApiDraft :api-drafts="result.apiDrafts" />
      <DbDraft :db-drafts="result.dbDrafts" />
      <TestChecklist :items="result.testChecklist" />
      <ReleaseChecklist :items="result.releaseChecklist" />
      <UncertainItems :items="result.uncertainItems" />
    </div>

    <div v-if="result.readmeDraft" class="readme-section">
      <h3>README 초안</h3>
      <pre class="readme-content">{{ result.readmeDraft }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PrdAnalysisResponse } from '../types/analysis'
import FeatureList from './FeatureList.vue'
import UserStories from './UserStories.vue'
import TodoBreakdown from './TodoBreakdown.vue'
import ApiDraft from './ApiDraft.vue'
import DbDraft from './DbDraft.vue'
import TestChecklist from './TestChecklist.vue'
import ReleaseChecklist from './ReleaseChecklist.vue'
import UncertainItems from './UncertainItems.vue'

defineProps<{ result: PrdAnalysisResponse }>()
</script>

<style scoped>
.analysis-result {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-header h2 {
  font-size: 1.5rem;
  color: #1a1a2e;
}

.result-id {
  font-size: 0.875rem;
  color: #999;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
}

.readme-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.readme-section h3 {
  margin-bottom: 1rem;
  color: #1a1a2e;
}

.readme-content {
  background: #f8f8f8;
  padding: 1rem;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
