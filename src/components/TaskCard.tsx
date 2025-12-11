import { Link } from 'react-router-dom'
import { Task } from '../types'
import { formatRelativeDate, getPriorityColor } from '../utils/helpers'
import './TaskCard.css'

interface TaskCardProps {
  task: Task
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
}

export default function TaskCard({ task, onToggleComplete, onDelete }: TaskCardProps) {
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    onToggleComplete(task.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id)
    }
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed

  return (
    <Link to={`/task/${task.id}`} className="task-card-link">
      <div className={`task-card ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
        <div className="task-card-header">
          <div className="task-checkbox-container">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggle}
              onClick={(e) => e.stopPropagation()}
              className="task-checkbox"
            />
            <h3 className="task-title">{task.title}</h3>
          </div>
          <button
            onClick={handleDelete}
            className="task-delete-btn"
            aria-label="Delete task"
          >
            ×
          </button>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-meta">
          <span
            className="task-priority"
            style={{ color: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>

          {task.dueDate && (
            <span className={`task-due-date ${isOverdue ? 'overdue' : ''}`}>
              {formatRelativeDate(new Date(task.dueDate))}
            </span>
          )}

          {task.complexity && (
            <span className="task-complexity">
              Complexity: {task.complexity}/10
            </span>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="task-tags">
            {task.tags.map((tag, index) => (
              <span key={index} className="task-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

