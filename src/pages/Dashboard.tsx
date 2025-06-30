import Navigation from '../components/Navigation'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { profile, isAdmin } = useAuth()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome back, {profile?.full_name}!
              </h1>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  {isAdmin ? '🔧 Admin Dashboard' : '🎓 Student Dashboard'}
                </h3>
                <p className="text-blue-700">
                  {isAdmin 
                    ? 'Manage opportunities, review submissions, and monitor platform activity.'
                    : 'Track your applications, discover new opportunities, and manage your profile.'
                  }
                </p>
              </div>
              <p className="text-gray-600">
                Dashboard functionality coming soon! This will include:
              </p>
              <ul className="mt-2 text-gray-600 list-disc list-inside space-y-1">
                {isAdmin ? (
                  <>
                    <li>Review pending opportunity submissions</li>
                    <li>Approve or reject opportunities</li>
                    <li>Manage user accounts</li>
                    <li>View platform analytics</li>
                  </>
                ) : (
                  <>
                    <li>Your bookmarked opportunities</li>
                    <li>Application status tracking</li>
                    <li>Personalized recommendations</li>
                    <li>Submission history</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 