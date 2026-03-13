<template>
  <div class="section-card">
    <h3 class="section-title">불확실 항목 ({{ items.length }})</h3>
    <div v-if="items.length === 0" class="empty">불확실 항목 없음</div>
    <ul v-else class="uncertain-list">
      <li v-for="(item, i) in items" :key="i" class="uncertain-item">
        ❓ {{ item }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: string[] }>()
</script>

<style scoped>
.section-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.section-title { font-size: 1.1rem; color: #1a1a2e; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #1a1a2e; }
.empty { color: #999; font-style: italic; }
.uncertain-list { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
.uncertain-item { padding: 0.5rem 0.75rem; background: #fef3c7; border-radius: 6px; font-size: 0.9rem; color: #92400e; }
</style>
