import { Priority } from '../types'
import { format, differenceInDays, addDays } from 'date-fns'

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function calculatePriority(dueDate?: Date, complexity: number = 1): Priority {
  if (!dueDate) return 'low'
  
  const daysUntilDue = differenceInDays(new Date(dueDate), new Date())
  const urgencyScore = daysUntilDue * complexity

  if (urgencyScore <= 2) return 'urgent'
  if (urgencyScore <= 7) return 'high'
  if (urgencyScore <= 14) return 'medium'
  return 'low'
}

export function estimateCompletion(complexity: number): Date {
  const baseDays = complexity * 2
  const variance = Math.floor(Math.random() * 3)
  return addDays(new Date(), baseDays + variance)
}

export function formatTaskDate(date: Date): string {
  return format(date, 'MMM dd, yyyy')
}

export function formatRelativeDate(date: Date): string {
  const days = differenceInDays(date, new Date())
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days <= 7) return `In ${days} days`
  return formatTaskDate(date)
}

export function getPriorityColor(priority: Priority): string {
  const colors = {
    low: '#6b7280',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444'
  }
  return colors[priority]
}

export function getPriorityWeight(priority: Priority): number {
  const weights = {
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4
  }
  return weights[priority]
}

export function sortTasks(tasks: any[], sortBy: string): any[] {
  const sorted = [...tasks]
  
  switch (sortBy) {
    case 'priority':
      return sorted.sort((a, b) => 
        getPriorityWeight(b.priority) - getPriorityWeight(a.priority)
      )
    case 'date':
      return sorted.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0
        return dateB - dateA
      })
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'complexity':
      return sorted.sort((a, b) => (b.complexity || 0) - (a.complexity || 0))
    default:
      return sorted
  }
}

export function validateTaskData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required')
  }
  
  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }
  
  if (data.dueDate && new Date(data.dueDate) < new Date()) {
    errors.push('Due date cannot be in the past')
  }
  
  if (data.complexity && (data.complexity < 1 || data.complexity > 10)) {
    errors.push('Complexity must be between 1 and 10')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

