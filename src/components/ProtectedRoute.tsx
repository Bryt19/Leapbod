import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { FcGoogle } from 'react-icons/fc'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  // Show loading spinner only while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Prompt sign-in via modal if not authenticated (keep user on page)
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-background/80" />
        <Dialog open onOpenChange={(open) => { if (!open) navigate('/') }}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>Sign in required</DialogTitle>
              <DialogDescription>Please sign in to access this page</DialogDescription>
            </DialogHeader>
            <div className="p-6 bg-card">
              {/* Brand */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-foreground">
                  Leap<span className="text-blue-600">bod</span>
                </h1>
                <p className="text-muted-foreground mt-1">Discover amazing opportunities</p>
              </div>

              {/* Headline */}
              <div className="mt-6 text-center">
                <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
                <p className="mt-1 text-sm text-muted-foreground">Sign in to access your dashboard</p>
              </div>

              {/* Google button */}
              <div className="mt-6">
                <button
                  onClick={() => { void signInWithGoogle() }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 border border-border bg-background hover:bg-muted transition text-foreground"
                >
                  <FcGoogle className="h-5 w-5" />
                  Continue with Google
                </button>
              </div>

              {/* Terms */}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                By signing in, you agree to our <a className="text-blue-600 hover:underline" href="#">Terms of Service</a> and <a className="text-blue-600 hover:underline" href="#">Privacy Policy</a>
              </p>

              {/* Info panel */}
              <div className="mt-6 rounded-lg border border-border bg-background/60 p-4">
                <h3 className="text-sm font-medium text-foreground mb-1">🎓 Student Platform</h3>
                <p className="text-sm text-muted-foreground">
                  Discover internships, scholarships, competitions, and research opportunities tailored for students.
                </p>
              </div>

              {/* Back */}
              <button
                onClick={() => navigate('/')}
                className="mt-4 w-full inline-flex items-center justify-center rounded-md px-4 py-2 border border-border text-foreground hover:bg-muted transition"
              >
                Go back home
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Admin routes: wait for profile to resolve, then check role
  if (requireAdmin) {
    if (!profile) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }
    if (profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page. Admin privileges are required.
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
    }
  }

  return <>{children}</>
} 