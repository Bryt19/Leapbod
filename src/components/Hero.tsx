import { useNavigate } from 'react-router-dom'
import { HiArrowRight } from 'react-icons/hi'
import { useAuth } from '../contexts/AuthContext'

const Hero = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleExplore = () => {
    if (user) {
      navigate('/opportunities')
    } else {
      navigate('/auth/login')
    }
  }

  const handleSubmit = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/auth/login')
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Gateway to Academic Success
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover scholarships, internships, and research opportunities all in one place.
            Take the next step in your academic journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleExplore}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              Explore Opportunities
              <HiArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={handleSubmit}
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              Submit Opportunity
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero 