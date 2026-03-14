<template>
  <div class="history-panel">
    <button class="history-toggle" @click="isOpen = !isOpen" :aria-expanded="isOpen">
      <History :size="18" />
      <span>분석 히스토리</span>
      <ChevronDown :size="16" class="chevron" :class="{ open: isOpen }" />
    </button>

    <div v-if="isOpen" class="history-body">
      <p v-if="recentList.length === 0" class="empty-state">
        아직 분석 기록이 없습니다
      </p>

      <ul v-else class="history-list">
        <li
          v-for="item in displayList"
          :key="item.id"
          class="history-card"
          role="button"
          tabindex="0"
          @click="$emit('select', item.id)"
          @keydown.enter.prevent="$emit('select', item.id)"
          @keydown.space.prevent="$emit('select', item.id)"
        >
          <div class="card-id">#{{ item.id }}</div>
          <div class="card-meta">
            <span class="card-date">{{ formatDate(item.createdAt) }}</span>
            <span class="card-count">기능 {{ item.features.length }}개</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { History, ChevronDown } from 'lucide-vue-next'
import type { PrdAnalysisResponse } from '../types/analysis'

const props = defineProps<{
  recentList: PrdAnalysisResponse[]
}>()

defineEmits<{
  select: [id: number]
}>()

const isOpen = ref(false)

const displayList = computed(() => props.recentList.slice(0, 3))

function formatDate(raw: string | number[]): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  if (Array.isArray(raw)) {
    const [year, month, day, hour = 0, min = 0] = raw
    const d = new Date(year, month - 1, day, hour, min)
    if (isNaN(d.getTime())) return String(raw)
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<style scoped>
.history-panel {
  margin-bottom: 1.5rem;
}

.history-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.5rem 0.9rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #444;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: border-color 0.15s;
}

.history-toggle:hover {
  border-color: #6366f1;
}

.chevron {
  margin-left: auto;
  transition: transform 0.2s;
}

.chevron.open {
  transform: rotate(180deg);
}

.history-body {
  margin-top: 0.5rem;
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

@media (max-width: 600px) {
  .history-list {
    grid-template-columns: 1fr;
  }
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
  min-width: 0;
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
