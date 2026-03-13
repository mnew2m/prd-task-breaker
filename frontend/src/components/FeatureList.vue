<template>
  <div class="section-card">
    <h3 class="section-title"><LayoutList :size="18" /> 기능 목록 ({{ features.length }})</h3>
    <div v-if="features.length === 0" class="empty">기능 없음</div>
    <div v-else class="feature-list">
      <div v-for="(f, i) in features" :key="i" class="feature-item">
        <div class="feature-header">
          <span class="feature-name">{{ f.name }}</span>
          <span class="badge" :class="priorityClass(f.priority)">{{ f.priority }}</span>
        </div>
        <p class="feature-desc">{{ f.description }}</p>
        <p v-if="f.notes" class="notes">📝 {{ f.notes }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeatureDto } from '../types/analysis'
import { LayoutList } from 'lucide-vue-next'

defineProps<{ features: FeatureDto[] }>()

function priorityClass(priority: string) {
  return {
    'badge-high': priority === 'HIGH',
    'badge-medium': priority === 'MEDIUM',
    'badge-low': priority === 'LOW'
  }
}
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

.empty {
  color: #999;
  font-style: italic;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-item {
  padding: 0.75rem;
  background: #f8f8f8;
  border-radius: 8px;
}

.feature-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.feature-name {
  font-weight: 600;
}

.badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-high { background: #fee2e2; color: #dc2626; }
.badge-medium { background: #fef3c7; color: #d97706; }
.badge-low { background: #d1fae5; color: #059669; }

.feature-desc {
  font-size: 0.9rem;
  color: #555;
}

.notes {
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.25rem;
}
</style>
