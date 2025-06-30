import Navigation from '../components/Navigation'

export default function OpportunitiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                All Opportunities
              </h1>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  🔍 Browse & Search
                </h3>
                <p className="text-green-700">
                  Complete opportunities listing with search, filters, and detailed views coming soon!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 