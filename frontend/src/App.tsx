import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Auth } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { Lesson } from './pages/Lesson'
import { useAuthStore } from './store/useAuthStore'
import { AdminPanel } from './pages/AdminPanel'

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  
  if (!token) return <Navigate to="/auth" />
  if (adminOnly && !user?.is_admin) return <Navigate to="/" />
  
  return <>{children}</>
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/lesson" 
          element={
            <ProtectedRoute>
              <Lesson />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App
