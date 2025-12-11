import { useState } from 'react'
import { useTasks } from '../store/TaskStore'
import TaskCard from '../components/TaskCard'
import TaskForm from '../components/TaskForm'
import TaskFilter from '../components/TaskFilter'
import { sortTasks } from '../utils/helpers'
import { SortOption } from '../types'
import './Dashboard.css'

export default function Dashboard() {
  const {
    tasks,
    projects,
    getFilteredTasks,
    addTask,
    toggleTaskComplete,
    deleteTask
  } = useTasks()

  const [showForm, setShowForm] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('priority')

  const filteredTasks = getFilteredTasks()
  const sortedTasks = sortTasks(filteredTasks, sortBy)

  const handleSubmit = (data: any) => {
    addTask({
      title: data.title,
      description: data.description,
      completed: false,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      projectId: data.projectId || undefined,
      tags: data.tags,
      complexity: data.complexity,
      assignee: data.assignee || undefined
    })
    setShowForm(false)
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Task Dashboard</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="add-task-btn"
        >
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <TaskForm
            onSubmit={handleSubmit}
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          />
        </div>
      )}

      <TaskFilter />

      <div className="dashboard-controls">
        <div className="sort-control">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="sort-select"
          >
            <option value="priority">Priority</option>
            <option value="date">Due Date</option>
            <option value="title">Title</option>
            <option value="complexity">Complexity</option>
          </select>
        </div>
        <div className="task-count">
          Showing {sortedTasks.length} of {tasks.length} tasks
        </div>
      </div>

      <div className="tasks-grid">
        {sortedTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. Create your first task to get started!</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={toggleTaskComplete}
              onDelete={deleteTask}
            />
          ))
        )}
      </div>
    </div>
  )
}

