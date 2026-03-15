<template>
  <div class="section-card" :class="{ 'section-collapsed': collapsed }">
    <h3 class="section-title" @click="emit('toggle-collapse')" :aria-expanded="!collapsed">
      <span class="title-inner"><Database :size="18" /> DB 초안 ({{ dbDrafts.length }})</span>
      <ChevronDown :size="16" class="section-chevron" :class="{ 'is-open': !collapsed }" />
    </h3>
    <div v-show="!collapsed">
      <div v-if="dbDrafts.length === 0" class="empty">DB 스키마 없음</div>
      <div v-else class="db-list">
        <div v-for="(d, i) in dbDrafts" :key="i" class="db-item">
          <div class="table-name">📋 {{ d.tableName }}</div>
          <ul class="columns">
            <li v-for="(col, j) in d.columns" :key="j">
              <code>{{ col }}</code>
            </li>
          </ul>
          <p v-if="d.notes" class="notes">📝 {{ d.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DbDraftDto } from '../types/analysis'
import { ChevronDown, Database } from 'lucide-vue-next'
defineProps<{ dbDrafts: DbDraftDto[]; collapsed?: boolean }>()
const emit = defineEmits<{ 'toggle-collapse': [] }>()
</script>

<style scoped>
@import '../assets/section-card.css';
.db-list { display: flex; flex-direction: column; gap: 0.75rem; }
.db-item { padding: 0.75rem; background: #f8f8f8; border-radius: 8px; }
.table-name { font-weight: 700; margin-bottom: 0.5rem; }
.columns { padding-left: 1.2rem; }
.columns li { font-size: 0.85rem; margin-bottom: 0.2rem; }
code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; font-family: monospace; }
.notes { font-size: 0.8rem; color: #888; margin-top: 0.5rem; }
</style>
