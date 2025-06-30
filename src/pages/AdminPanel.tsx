import Navigation from '../components/Navigation'

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Admin Panel
              </h1>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-amber-800 mb-2">
                  🚧 Under Construction
                </h3>
                <p className="text-amber-700">
                  The admin panel is being developed. Here you'll be able to manage all platform operations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 