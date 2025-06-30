import React from 'react'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Features from './components/Features'
import FeaturedOpportunities from './components/FeaturedOpportunities'
import CallToAction from './components/CallToAction'
import Footer from './components/Footer'

const App = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <Features />
      <FeaturedOpportunities />
      <CallToAction />
      <Footer />
    </div>
  )
}

export default App