import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import OpportunitiesPage from './pages/OpportunitiesPage'
import SubmitOpportunity from './pages/SubmitOpportunity'
import ProtectedRoute from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected routes */}
        <Route 
          path="/opportunities" 
          element={
            <ErrorBoundary>
              <OpportunitiesPage />
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/submit" 
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <SubmitOpportunity />
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Admin-only routes */}
        <Route 
          path="/admin" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requireAdmin>
                <AdminPanel />
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App