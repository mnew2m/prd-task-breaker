<template>
  <div class="section-card" :class="{ 'section-collapsed': collapsed }">
    <h3 class="section-title" @click="emit('toggle-collapse')" :aria-expanded="!collapsed">
      <span class="title-inner"><FlaskConical :size="18" /> 테스트 체크리스트 ({{ items.length }})</span>
      <ChevronDown :size="16" class="section-chevron" :class="{ 'is-open': !collapsed }" />
    </h3>
    <div class="section-body">
    <div v-if="items.length === 0" class="empty">항목 없음</div>
    <ul v-else class="checklist">
      <li v-for="(item, i) in items" :key="i" class="checklist-item">
        <span class="bullet">•</span>
        <span class="item-text">
          {{ item.item }}
          <span v-if="item.uncertain" class="uncertain">?</span>
        </span>
        <span class="category-tag">{{ item.category }}</span>
      </li>
    </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChecklistItemDto } from '../types/analysis'
import { ChevronDown, FlaskConical } from 'lucide-vue-next'
defineProps<{ items: ChecklistItemDto[]; collapsed?: boolean }>()
const emit = defineEmits<{ 'toggle-collapse': [] }>()
</script>

<style scoped>
@import '../assets/section-card.css';
.checklist { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
.checklist-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f8f8f8; border-radius: 6px; }
.bullet { font-size: 1rem; color: #888; }
.item-text { font-size: 0.9rem; flex: 1; }
.uncertain { background: #fef3c7; color: #d97706; padding: 0.1rem 0.3rem; border-radius: 4px; font-size: 0.75rem; margin-left: 0.25rem; }
.category-tag { font-size: 0.75rem; background: #e8e8f0; padding: 0.1rem 0.4rem; border-radius: 4px; color: #666; }
</style>
