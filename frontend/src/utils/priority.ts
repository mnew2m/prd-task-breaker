import type { Priority } from '../types/analysis'

export function priorityClass(priority: Priority | string) {
  return {
    'badge-high': priority === 'HIGH',
    'badge-medium': priority === 'MEDIUM',
    'badge-low': priority === 'LOW',
  }
}
