<template>
  <div class="section-card">
    <h3 class="section-title">유저 스토리 ({{ stories.length }})</h3>
    <div v-if="stories.length === 0" class="empty">스토리 없음</div>
    <div v-else class="story-list">
      <div v-for="(s, i) in stories" :key="i" class="story-item">
        <p class="story-text">
          <strong>{{ s.role }}</strong>로서, <strong>{{ s.action }}</strong>하고 싶다.
          그래서 <em>{{ s.benefit }}</em>
        </p>
        <div v-if="s.acceptanceCriteria?.length" class="criteria">
          <p class="criteria-title">인수 기준:</p>
          <ul>
            <li v-for="(c, j) in s.acceptanceCriteria" :key="j">{{ c }}</li>
          </ul>
        </div>
        <p v-if="s.notes" class="notes">📝 {{ s.notes }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserStoryDto } from '../types/analysis'
defineProps<{ stories: UserStoryDto[] }>()
</script>

<style scoped>
.section-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.section-title {
  font-size: 1.1rem;
  color: #1a1a2e;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #1a1a2e;
}
.empty { color: #999; font-style: italic; }
.story-list { display: flex; flex-direction: column; gap: 0.75rem; }
.story-item {
  padding: 0.75rem;
  background: #f8f8f8;
  border-radius: 8px;
}
.story-text { font-size: 0.9rem; margin-bottom: 0.5rem; }
.criteria-title { font-size: 0.8rem; font-weight: 600; margin-bottom: 0.25rem; }
.criteria ul { padding-left: 1.2rem; }
.criteria li { font-size: 0.85rem; color: #555; }
.notes { font-size: 0.8rem; color: #888; margin-top: 0.25rem; }
</style>
