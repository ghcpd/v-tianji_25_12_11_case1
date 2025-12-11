import { useTasks } from '../store/TaskStore'
import { Priority, SortOption } from '../types'
import { debounce } from '../utils/helpers'
import './TaskFilter.css'

export default function TaskFilter() {
  const { filters, projects, setFilter } = useTasks()

  const handleSearchChange = debounce((value: string) => {
    setFilter({ searchQuery: value })
  }, 300)

  return (
    <div className="task-filter">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Search tasks..."
          className="search-input"
          defaultValue={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="status-filter">Status</label>
        <select
          id="status-filter"
          value={filters.status}
          onChange={(e) => setFilter({ status: e.target.value as any })}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="priority-filter">Priority</label>
        <select
          id="priority-filter"
          value={filters.priority}
          onChange={(e) => setFilter({ priority: e.target.value as Priority | 'all' })}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="project-filter">Project</label>
        <select
          id="project-filter"
          value={filters.projectId || ''}
          onChange={(e) => setFilter({ projectId: e.target.value || null })}
          className="filter-select"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

