<template>
  <div class="section-card">
    <h3 class="section-title">릴리즈 체크리스트 ({{ items.length }})</h3>
    <div v-if="items.length === 0" class="empty">항목 없음</div>
    <ul v-else class="checklist">
      <li v-for="(item, i) in items" :key="i" class="checklist-item">
        <input type="checkbox" :id="`release-${i}`" />
        <label :for="`release-${i}`">{{ item.item }}</label>
        <span class="category-tag">{{ item.category }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { ChecklistItemDto } from '../types/analysis'
defineProps<{ items: ChecklistItemDto[] }>()
</script>

<style scoped>
.section-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.section-title { font-size: 1.1rem; color: #1a1a2e; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #1a1a2e; }
.empty { color: #999; font-style: italic; }
.checklist { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
.checklist-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f8f8f8; border-radius: 6px; }
label { font-size: 0.9rem; flex: 1; cursor: pointer; }
.category-tag { font-size: 0.75rem; background: #e8e8f0; padding: 0.1rem 0.4rem; border-radius: 4px; color: #666; }
</style>
