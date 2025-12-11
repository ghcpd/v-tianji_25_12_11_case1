export type TaskStatus = 'pending' | 'in-progress' | 'completed'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: Priority
  dueDate?: Date
  projectId?: string
  tags?: string[]
  complexity?: number
  estimatedCompletion?: Date
  createdAt: Date
  updatedAt: Date
  assignee?: string
  dependencies?: string[]
}

export interface Project {
  id: string
  name: string
  description?: string
  color?: string
  createdAt: Date
}

export interface FilterState {
  status: 'all' | 'completed' | 'pending'
  priority: 'all' | Priority
  projectId: string | null
  searchQuery: string
}

export type SortOption = 'date' | 'priority' | 'title' | 'complexity'

export interface TaskFormData {
  title: string
  description: string
  priority: Priority
  dueDate: string
  projectId: string
  tags: string[]
  complexity: number
  assignee: string
}

