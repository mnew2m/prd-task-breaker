<template>
  <div class="section-card">
    <h3 class="section-title">DB 초안 ({{ dbDrafts.length }})</h3>
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
</template>

<script setup lang="ts">
import type { DbDraftDto } from '../types/analysis'
defineProps<{ dbDrafts: DbDraftDto[] }>()
</script>

<style scoped>
.section-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.section-title { font-size: 1.1rem; color: #1a1a2e; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #1a1a2e; }
.empty { color: #999; font-style: italic; }
.db-list { display: flex; flex-direction: column; gap: 0.75rem; }
.db-item { padding: 0.75rem; background: #f8f8f8; border-radius: 8px; }
.table-name { font-weight: 700; margin-bottom: 0.5rem; }
.columns { padding-left: 1.2rem; }
.columns li { font-size: 0.85rem; margin-bottom: 0.2rem; }
code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; font-family: monospace; }
.notes { font-size: 0.8rem; color: #888; margin-top: 0.5rem; }
</style>
