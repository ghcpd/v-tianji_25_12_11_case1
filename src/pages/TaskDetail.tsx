import { useParams, useNavigate } from 'react-router-dom'
import { useTasks } from '../store/TaskStore'
import TaskForm from '../components/TaskForm'
import { formatTaskDate } from '../utils/helpers'
import './TaskDetail.css'

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tasks, projects, updateTask, deleteTask } = useTasks()

  const task = tasks.find((t) => t.id === id)

  if (!task) {
    return (
      <div className="task-detail">
        <div className="error-state">
          <h2>Task not found</h2>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const handleUpdate = (data: any) => {
    updateTask(task.id, {
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      projectId: data.projectId || undefined,
      tags: data.tags,
      complexity: data.complexity,
      assignee: data.assignee || undefined
    })
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id)
      navigate('/')
    }
  }

  const project = task.projectId
    ? projects.find((p) => p.id === task.projectId)
    : null

  return (
    <div className="task-detail">
      <div className="task-detail-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back
        </button>
        <button onClick={handleDelete} className="delete-btn">
          Delete Task
        </button>
      </div>

      <div className="task-detail-content">
        <div className="task-detail-info">
          <h1>{task.title}</h1>

          {task.description && (
            <div className="info-section">
              <h3>Description</h3>
              <p>{task.description}</p>
            </div>
          )}

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className={`info-value status ${task.completed ? 'completed' : 'pending'}`}>
                {task.completed ? 'Completed' : 'Pending'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Priority</span>
              <span className="info-value priority" style={{ color: getPriorityColor(task.priority) }}>
                {task.priority}
              </span>
            </div>

            {task.dueDate && (
              <div className="info-item">
                <span className="info-label">Due Date</span>
                <span className="info-value">
                  {formatTaskDate(new Date(task.dueDate))}
                </span>
              </div>
            )}

            {task.complexity && (
              <div className="info-item">
                <span className="info-label">Complexity</span>
                <span className="info-value">{task.complexity}/10</span>
              </div>
            )}

            {task.assignee && (
              <div className="info-item">
                <span className="info-label">Assignee</span>
                <span className="info-value">{task.assignee}</span>
              </div>
            )}

            {project && (
              <div className="info-item">
                <span className="info-label">Project</span>
                <span className="info-value">{project.name}</span>
              </div>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="info-section">
              <h3>Tags</h3>
              <div className="tags-list">
                {task.tags.map((tag, index) => (
                  <span key={index} className="tag-item">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="info-section">
            <span className="info-label">Created</span>
            <span className="info-value">
              {formatTaskDate(task.createdAt)}
            </span>
          </div>

          <div className="info-section">
            <span className="info-label">Last Updated</span>
            <span className="info-value">
              {formatTaskDate(task.updatedAt)}
            </span>
          </div>
        </div>

        <div className="task-detail-form">
          <h2>Edit Task</h2>
          <TaskForm
            onSubmit={handleUpdate}
            initialData={{
              title: task.title,
              description: task.description || '',
              priority: task.priority,
              dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
              projectId: task.projectId || '',
              tags: task.tags || [],
              complexity: task.complexity || 1,
              assignee: task.assignee || ''
            }}
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          />
        </div>
      </div>
    </div>
  )
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: '#6b7280',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444'
  }
  return colors[priority] || '#6b7280'
}

