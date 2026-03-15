<template>
  <div class="section-card" :class="{ 'section-collapsed': collapsed }">
    <h3 class="section-title" @click="emit('toggle-collapse')" :aria-expanded="!collapsed">
      <span class="title-inner"><Users :size="18" /> 유저 스토리 ({{ stories.length }})</span>
      <ChevronDown :size="16" class="section-chevron" :class="{ 'is-open': !collapsed }" />
    </h3>
    <div class="section-body">
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
  </div>
</template>

<script setup lang="ts">
import type { UserStoryDto } from '../types/analysis'
import { ChevronDown, Users } from 'lucide-vue-next'
defineProps<{ stories: UserStoryDto[]; collapsed?: boolean }>()
const emit = defineEmits<{ 'toggle-collapse': [] }>()
</script>

<style scoped>
@import '../assets/section-card.css';
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
