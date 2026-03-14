<template>
  <div class="section-card">
    <h3 class="section-title"><HelpCircle :size="18" /> 불확실 항목 ({{ items.length }})</h3>
    <div v-if="items.length === 0" class="empty">불확실 항목 없음</div>
    <ul v-else class="uncertain-list">
      <li v-for="(item, i) in items" :key="i" class="uncertain-item">
        ❓ {{ item }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { HelpCircle } from 'lucide-vue-next'
defineProps<{ items: string[] }>()
</script>

<style scoped>
@import '../assets/section-card.css';
.uncertain-list { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
.uncertain-item { padding: 0.5rem 0.75rem; background: #fef3c7; border-radius: 6px; font-size: 0.9rem; color: #92400e; }
</style>
