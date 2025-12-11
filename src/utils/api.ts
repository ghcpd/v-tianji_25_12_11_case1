import axios from 'axios'
import { Task, Project } from '../types'

const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export async function fetchTasks(): Promise<Task[]> {
  const response = await apiClient.get('/tasks')
  return response.data.map(transformTaskFromApi)
}

export async function fetchTaskById(id: string): Promise<Task> {
  const response = await apiClient.get(`/tasks/${id}`)
  return transformTaskFromApi(response.data)
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const response = await apiClient.post('/tasks', transformTaskToApi(task))
  return transformTaskFromApi(response.data)
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const response = await apiClient.patch(`/tasks/${id}`, transformTaskToApi(updates))
  return transformTaskFromApi(response.data)
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`)
}

export async function fetchProjects(): Promise<Project[]> {
  const response = await apiClient.get('/projects')
  return response.data.map(transformProjectFromApi)
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
  const response = await apiClient.post('/projects', transformProjectToApi(project))
  return transformProjectFromApi(response.data)
}

function transformTaskFromApi(data: any): Task {
  return {
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    estimatedCompletion: data.estimatedCompletion ? new Date(data.estimatedCompletion) : undefined
  }
}

function transformTaskToApi(task: any): any {
  return {
    ...task,
    dueDate: task.dueDate?.toISOString(),
    createdAt: task.createdAt?.toISOString(),
    updatedAt: task.updatedAt?.toISOString(),
    estimatedCompletion: task.estimatedCompletion?.toISOString()
  }
}

function transformProjectFromApi(data: any): Project {
  return {
    ...data,
    createdAt: new Date(data.createdAt)
  }
}

function transformProjectToApi(project: any): any {
  return {
    ...project,
    createdAt: project.createdAt?.toISOString()
  }
}

