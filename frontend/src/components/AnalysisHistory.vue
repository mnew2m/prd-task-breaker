<template>
  <div class="history-panel">
    <h2 class="history-title">
      <History :size="20" />
      분석 히스토리
    </h2>

    <p v-if="recentList.length === 0" class="empty-state">
      아직 분석 기록이 없습니다
    </p>

    <ul v-else class="history-list">
      <li
        v-for="item in recentList"
        :key="item.id"
        class="history-card"
        @click="$emit('select', item.id)"
      >
        <div class="card-id">#{{ item.id }}</div>
        <div class="card-meta">
          <span class="card-date">{{ formatDate(item.createdAt) }}</span>
          <span class="card-count">기능 {{ item.features.length }}개</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { History } from 'lucide-vue-next'
import type { PrdAnalysisResponse } from '../types/analysis'

defineProps<{
  recentList: PrdAnalysisResponse[]
}>()

defineEmits<{
  select: [id: number]
}>()

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.history-panel {
  margin-bottom: 1.5rem;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 0.75rem;
}

.empty-state {
  color: #999;
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem;
  border: 1px dashed #ddd;
  border-radius: 8px;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.9rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.history-card:hover {
  border-color: #6366f1;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.15);
}

.card-id {
  font-weight: 700;
  color: #6366f1;
  font-size: 0.85rem;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.card-date {
  font-size: 0.8rem;
  color: #555;
}

.card-count {
  font-size: 0.75rem;
  color: #888;
}
</style>
