import { createContext, useContext, ReactNode } from 'react'
import create from 'zustand'
import { Task, Project, FilterState, SortOption } from '../types'
import { generateId, calculatePriority, estimateCompletion } from '../utils/helpers'

interface TaskState {
  tasks: Task[]
  projects: Project[]
  filters: FilterState
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTaskComplete: (id: string) => void
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void
  setFilter: (filter: Partial<FilterState>) => void
  getFilteredTasks: () => Task[]
  getTasksByProject: (projectId: string) => Task[]
  getTaskStatistics: () => { total: number; completed: number; pending: number; overdue: number }
}

const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  projects: [],
  filters: {
    status: 'all',
    priority: 'all',
    projectId: null,
    searchQuery: ''
  },

  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: taskData.priority || calculatePriority(taskData.dueDate, taskData.complexity || 1),
      estimatedCompletion: taskData.estimatedCompletion || estimateCompletion(taskData.complexity || 1)
    }
    set((state) => ({ tasks: [...state.tasks, newTask] }))
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    }))
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id)
    }))
  },

  toggleTaskComplete: (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed, updatedAt: new Date() }
          : task
      )
    }))
  },

  addProject: (projectData) => {
    const newProject: Project = {
      ...projectData,
      id: generateId(),
      createdAt: new Date()
    }
    set((state) => ({ projects: [...state.projects, newProject] }))
  },

  setFilter: (filter) => {
    set((state) => ({
      filters: { ...state.filters, ...filter }
    }))
  },

  getFilteredTasks: () => {
    const { tasks, filters } = get()
    return tasks.filter((task) => {
      if (filters.status !== 'all' && task.completed !== (filters.status === 'completed')) {
        return false
      }
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false
      }
      if (filters.projectId && task.projectId !== filters.projectId) {
        return false
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        return (
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(query))
        )
      }
      return true
    })
  },

  getTasksByProject: (projectId) => {
    return get().tasks.filter((task) => task.projectId === projectId)
  },

  getTaskStatistics: () => {
    const { tasks } = get()
    const now = new Date()
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      pending: tasks.filter((t) => !t.completed).length,
      overdue: tasks.filter(
        (t) => !t.completed && t.dueDate && new Date(t.dueDate) < now
      ).length
    }
  }
}))

const TaskContext = createContext<ReturnType<typeof useTaskStore> | null>(null)

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const store = useTaskStore()
  return <TaskContext.Provider value={store}>{children}</TaskContext.Provider>
}

export const useTasks = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTasks must be used within TaskProvider')
  }
  return context
}

