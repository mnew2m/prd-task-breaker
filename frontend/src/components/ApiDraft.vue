<template>
  <div class="section-card">
    <h3 class="section-title"><Globe :size="18" /> API 초안 ({{ apiDrafts.length }})</h3>
    <div v-if="apiDrafts.length === 0" class="empty">API 없음</div>
    <div v-else class="api-list">
      <div v-for="(a, i) in apiDrafts" :key="i" class="api-item">
        <div class="api-header">
          <span class="method" :class="methodClass(a.method)">{{ a.method }}</span>
          <code class="path">{{ a.path }}</code>
        </div>
        <p class="api-desc">{{ a.description }}</p>
        <div v-if="a.requestBody" class="body-section">
          <span class="body-label">Request:</span>
          <code>{{ a.requestBody }}</code>
        </div>
        <div v-if="a.responseBody" class="body-section">
          <span class="body-label">Response:</span>
          <code>{{ a.responseBody }}</code>
        </div>
        <p v-if="a.notes" class="notes">📝 {{ a.notes }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiDraftDto } from '../types/analysis'
import { Globe } from 'lucide-vue-next'
defineProps<{ apiDrafts: ApiDraftDto[] }>()

function methodClass(m: string) {
  return {
    'method-get': m === 'GET', 'method-post': m === 'POST',
    'method-put': m === 'PUT', 'method-delete': m === 'DELETE', 'method-patch': m === 'PATCH'
  }
}
</script>

<style scoped>
@import '../assets/section-card.css';
.api-list { display: flex; flex-direction: column; gap: 0.75rem; }
.api-item { padding: 0.75rem; background: #f8f8f8; border-radius: 8px; overflow: hidden; }
.api-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
.method { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 700; }
.method-get { background: #d1fae5; color: #059669; }
.method-post { background: #dbeafe; color: #2563eb; }
.method-put { background: #fef3c7; color: #d97706; }
.method-delete { background: #fee2e2; color: #dc2626; }
.method-patch { background: #ede9fe; color: #7c3aed; }
.path { font-size: 0.9rem; background: #e8e8e8; padding: 0.1rem 0.4rem; border-radius: 4px; }
.api-desc { font-size: 0.875rem; color: #555; margin-bottom: 0.25rem; }
.body-section { font-size: 0.8rem; margin-top: 0.25rem; }
.body-label { font-weight: 600; color: #666; margin-right: 0.25rem; }
.body-section code {
  display: block;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: break-word;
  max-width: 100%;
  padding: 0.4rem 0.6rem;
  margin-top: 0.25rem;
}
code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
.notes { font-size: 0.8rem; color: #888; margin-top: 0.25rem; }
</style>
