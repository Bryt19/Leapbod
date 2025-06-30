import React from 'react'
import { 
  HiSearch as Search, 
  HiAcademicCap as Trophy, 
  HiUsers as Users 
} from 'react-icons/hi'

const Features = () => {
  const features = [
    {
      icon: Search,
      title: "Discover",
      description: "Browse curated opportunities including internships, scholarships, competitions, and events tailored for students.",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Trophy,
      title: "Apply & Track",
      description: "Keep track of your applications and bookmark opportunities for later. Never miss a deadline again.",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: Users,
      title: "Contribute",
      description: "Share opportunities you discover with the community. Help your peers find their next big break.",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    }
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Leap Forward
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover, apply, and track opportunities all in one place. Built by students, for students.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-6`}>
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features 