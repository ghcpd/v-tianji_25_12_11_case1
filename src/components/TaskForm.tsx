import { useState, FormEvent } from 'react'
import { TaskFormData, Priority } from '../types'
import { validateTaskData } from '../utils/helpers'
import './TaskForm.css'

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void
  initialData?: Partial<TaskFormData>
  projects: Array<{ id: string; name: string }>
}

export default function TaskForm({ onSubmit, initialData, projects }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    dueDate: initialData?.dueDate || '',
    projectId: initialData?.projectId || '',
    tags: initialData?.tags || [],
    complexity: initialData?.complexity || 1,
    assignee: initialData?.assignee || ''
  })

  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    const validation = validateTaskData(formData)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setErrors([])
    onSubmit(formData)
    
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      projectId: '',
      tags: [],
      complexity: 1,
      assignee: ''
    })
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="task-form">
      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              {error}
            </div>
          ))}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          maxLength={200}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="complexity">Complexity (1-10)</label>
          <input
            type="number"
            id="complexity"
            min="1"
            max="10"
            value={formData.complexity}
            onChange={(e) => setFormData({ ...formData, complexity: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectId">Project</label>
          <select
            id="projectId"
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
          >
            <option value="">None</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="assignee">Assignee</label>
        <input
          type="text"
          id="assignee"
          value={formData.assignee}
          onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
          placeholder="Enter assignee name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <div className="tag-input-container">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            placeholder="Press Enter to add tag"
          />
          <button type="button" onClick={handleAddTag} className="add-tag-btn">
            Add
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="tags-display">
            {formData.tags.map((tag, index) => (
              <span key={index} className="tag-display-item">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="tag-remove-btn"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="submit-btn">
        {initialData ? 'Update Task' : 'Create Task'}
      </button>
    </form>
  )
}

