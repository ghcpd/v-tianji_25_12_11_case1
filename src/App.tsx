import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TaskProvider } from './store/TaskStore'
import Dashboard from './pages/Dashboard'
import TaskDetail from './pages/TaskDetail'
import ProjectView from './pages/ProjectView'
import Layout from './components/Layout'

function App() {
  return (
    <TaskProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/task/:id" element={<TaskDetail />} />
            <Route path="/project/:projectId" element={<ProjectView />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TaskProvider>
  )
}

export default App

