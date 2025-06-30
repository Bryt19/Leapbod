import React from 'react'
import { useNavigate } from 'react-router-dom'
import { HiArrowRight as ArrowRight } from 'react-icons/hi'
import { useAuth } from '../contexts/AuthContext'

const Hero = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleExploreOpportunities = () => {
    if (user) {
      navigate('/opportunities')
    } else {
      navigate('/auth/login')
    }
  }

  const handleSubmitOpportunity = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/auth/login')
    }
  }

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Discover Your Next
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block mt-2">
              Big Opportunity
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed">
            Connect with internships, scholarships, events, and opportunities that will accelerate your career. 
            Submit your own discoveries and help build a community of growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleExploreOpportunities}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              {user ? 'Explore Opportunities' : 'Get Started'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button 
              onClick={handleSubmitOpportunity}
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Submit an Opportunity
            </button>
          </div>
        </div>
      </div>
      
      {/* Floating Elements for Visual Interest */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500 bg-opacity-20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500 bg-opacity-20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-500 bg-opacity-20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    </section>
  )
}

export default Hero 