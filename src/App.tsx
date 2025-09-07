import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy load pages for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const Login = lazy(() => import("./pages/Login"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const OpportunitiesPage = lazy(() => import("./pages/OpportunitiesPage"));
const SubmitOpportunity = lazy(() => import("./pages/SubmitOpportunity"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <div className="App">
      <Suspense fallback={<LoadingSpinner />}>
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
      </Suspense>
    </div>
  );
}

export default App;
