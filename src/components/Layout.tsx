import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTasks } from '../store/TaskStore'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { getTaskStatistics } = useTasks()
  const stats = getTaskStatistics()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/">TaskManager</Link>
        </div>
        <div className="nav-stats">
          <span className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{stats.total}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">Pending:</span>
            <span className="stat-value">{stats.pending}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">Completed:</span>
            <span className="stat-value">{stats.completed}</span>
          </span>
          {stats.overdue > 0 && (
            <span className="stat-item overdue">
              <span className="stat-label">Overdue:</span>
              <span className="stat-value">{stats.overdue}</span>
            </span>
          )}
        </div>
        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  )
}

