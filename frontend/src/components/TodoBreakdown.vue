<template>
  <div class="section-card" :class="{ 'section-collapsed': collapsed }">
    <h3 class="section-title" @click="emit('toggle-collapse')" :aria-expanded="!collapsed">
      <span class="title-inner"><CheckSquare :size="18" /> TODO 항목 ({{ todos.length }})</span>
      <ChevronDown :size="16" class="section-chevron" :class="{ 'is-open': !collapsed }" />
    </h3>
    <div v-show="!collapsed">
    <div v-if="todos.length === 0" class="empty">TODO 없음</div>
    <div v-else class="todo-list">
      <div v-for="(t, i) in todos" :key="i" class="todo-item">
        <div class="todo-header">
          <span class="todo-task">{{ t.task }}</span>
          <span class="badge" :class="priorityClass(t.priority)">{{ t.priority }}</span>
        </div>
        <div class="todo-meta">
          <span class="category">{{ t.category }}</span>
          <span v-if="t.estimatedEffort" class="effort">⏱ {{ t.estimatedEffort }}</span>
        </div>
        <p v-if="t.notes" class="notes">📝 {{ t.notes }}</p>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TodoItemDto } from '../types/analysis'
import { ChevronDown, CheckSquare } from 'lucide-vue-next'
import { priorityClass } from '../utils/priority'

defineProps<{ todos: TodoItemDto[]; collapsed?: boolean }>()
const emit = defineEmits<{ 'toggle-collapse': [] }>()
</script>

<style scoped>
@import '../assets/section-card.css';
.todo-list { display: flex; flex-direction: column; gap: 0.75rem; }
.todo-item { padding: 0.75rem; background: #f8f8f8; border-radius: 8px; }
.todo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
.todo-task { font-weight: 600; font-size: 0.9rem; }
.todo-meta { display: flex; gap: 0.5rem; font-size: 0.8rem; color: #777; margin-top: 0.25rem; }
.category { background: #e8e8f0; padding: 0.1rem 0.4rem; border-radius: 4px; }
.badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.badge-high { background: #fee2e2; color: #dc2626; }
.badge-medium { background: #fef3c7; color: #d97706; }
.badge-low { background: #d1fae5; color: #059669; }
.notes { font-size: 0.8rem; color: #888; margin-top: 0.25rem; }
</style>
