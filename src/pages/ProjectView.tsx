import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTasks } from '../store/TaskStore'
import TaskCard from '../components/TaskCard'
import { sortTasks } from '../utils/helpers'
import { SortOption } from '../types'
import './ProjectView.css'

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { projects, getTasksByProject, toggleTaskComplete, deleteTask } = useTasks()

  const project = projects.find((p) => p.id === projectId)
  const projectTasks = projectId ? getTasksByProject(projectId) : []
  const [sortBy, setSortBy] = useState<SortOption>('priority')
  const sortedTasks = sortTasks(projectTasks, sortBy)

  if (!project) {
    return (
      <div className="project-view">
        <div className="error-state">
          <h2>Project not found</h2>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const completedCount = sortedTasks.filter((t) => t.completed).length
  const totalCount = sortedTasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="project-view">
      <div className="project-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back
        </button>
      </div>

      <div className="project-info">
        <h1>{project.name}</h1>
        {project.description && <p className="project-description">{project.description}</p>}

        <div className="project-stats">
          <div className="stat-card">
            <span className="stat-number">{totalCount}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{completedCount}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{totalCount - completedCount}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{Math.round(progress)}%</span>
            <span className="stat-label">Progress</span>
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="project-controls">
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
      </div>

      <div className="project-tasks">
        {sortedTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks in this project yet.</p>
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

