import React, { useState, useEffect } from 'react'
import { HiArrowRight as ArrowRight } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Opportunity } from '../types/database.types'
import OpportunityCard from './OpportunityCard'

const FeaturedOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedOpportunities()
  }, [])

  const fetchFeaturedOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('status', 'approved')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) throw error
      setOpportunities(data || [])
    } catch (error) {
      console.error('Error fetching featured opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fallback hardcoded opportunities if no featured ones exist
  const fallbackOpportunities: Opportunity[] = [
    {
      id: 'fallback-1',
      title: "Google Summer Internship 2024",
      category: "internship",
      deadline: "2024-03-15",
      location: "Remote",
      organization: "Google",
      description: "Join Google's engineering team for a transformative summer experience working on cutting-edge projects...",
      application_url: "https://careers.google.com",
      featured: true,
      status: 'approved',
      views_count: 500,
      applications_count: 25,
      created_at: new Date().toISOString()
    },
    {
      id: 'fallback-2',
      title: "Merit Scholarship Program",
      category: "scholarship",
      deadline: "2024-02-28",
      location: "US",
      organization: "National Science Foundation",
      description: "Full tuition scholarship for outstanding students in STEM fields with exceptional academic records...",
      application_url: "https://nsf.gov",
      featured: true,
      status: 'approved',
      views_count: 350,
      applications_count: 40,
      created_at: new Date().toISOString()
    },
    {
      id: 'fallback-3',
      title: "Startup Competition 2024",
      category: "competition",
      deadline: "2024-04-10",
      location: "San Francisco",
      organization: "TechCrunch",
      description: "Pitch your startup idea for a chance to win $50,000 in funding and mentorship from industry leaders...",
      application_url: "https://techcrunch.com",
      featured: true,
      status: 'approved',
      views_count: 275,
      applications_count: 15,
      created_at: new Date().toISOString()
    }
  ]

  const displayOpportunities = opportunities.length > 0 ? opportunities : fallbackOpportunities

  return (
    <section className="py-20 bg-white" id="opportunities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured Opportunities</h2>
            <p className="text-gray-600">Hand-picked opportunities waiting for you</p>
          </div>
          <Link 
            to="/opportunities" 
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center group"
          >
            View All
            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  <div className="h-4 w-12 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-16 w-full bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between mb-6">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-12 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                showBookmark={false} // Don't show bookmark on homepage
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedOpportunities 