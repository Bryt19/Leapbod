import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import CommunityPage from "./pages/CommunityPage";
import SubmitOpportunity from "./pages/SubmitOpportunity";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import BlogPage from "./pages/BlogPage";
import EmployersPage from "./pages/EmployersPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NetworkStatus } from "./components/NetworkStatus";

function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    const p = location.pathname + (location.search || "");
    if (p !== "/auth/login" && p !== "/auth/callback") {
      localStorage.setItem("lastPath", p);
    }
  }, [location]);
  return null;
}

function App() {
  return (
    <div className="App">
      <RouteTracker />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/employers" element={<EmployersPage />} />

        {/* Protected routes */}
        <Route
          path="/opportunities"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <OpportunitiesPage />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/community"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
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
      <NetworkStatus />
    </div>
  );
}

export default App;
