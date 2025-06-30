import React from 'react'
import { 
  HiArrowRight as ArrowRight, 
  HiStar as Star, 
  HiCalendar as Calendar, 
  HiLocationMarker as MapPin 
} from 'react-icons/hi'

const FeaturedOpportunities = () => {
  const opportunities = [
    {
      title: "Google Summer Internship 2024",
      category: "Internship",
      deadline: "Mar 15, 2024",
      location: "Remote",
      description: "Join Google's engineering team for a transformative summer experience...",
      rating: 4.9,
      categoryColor: "bg-blue-100 text-blue-800"
    },
    {
      title: "Merit Scholarship Program",
      category: "Scholarship",
      deadline: "Feb 28, 2024",
      location: "US",
      description: "Full tuition scholarship for outstanding students in STEM fields...",
      rating: 4.8,
      categoryColor: "bg-green-100 text-green-800"
    },
    {
      title: "Startup Competition 2024",
      category: "Competition",
      deadline: "Apr 10, 2024",
      location: "San Francisco",
      description: "Pitch your startup idea for a chance to win $50,000 in funding...",
      rating: 4.7,
      categoryColor: "bg-purple-100 text-purple-800"
    }
  ]

  return (
    <section className="py-20 bg-white" id="opportunities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured Opportunities</h2>
            <p className="text-gray-600">Hand-picked opportunities waiting for you</p>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center group">
            View All
            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opportunity, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${opportunity.categoryColor}`}>
                  {opportunity.category}
                </span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{opportunity.rating}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {opportunity.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{opportunity.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {opportunity.deadline}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {opportunity.location}
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedOpportunities 