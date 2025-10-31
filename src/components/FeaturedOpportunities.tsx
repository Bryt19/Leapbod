import { useState, useEffect } from 'react'
import { HiArrowRight as ArrowRight } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Opportunity } from '../types/database.types'
import OpportunityCard from './OpportunityCard'
import { getCache, setCache } from '../lib/utils'

const FeaturedOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = getCache<Opportunity[]>("featured:v1")
    if (cached && cached.length) {
      setOpportunities(cached)
      setLoading(false)
    }
    fetchFeaturedOpportunities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchFeaturedOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('id,title,category,deadline,location,organization,description,application_url,featured,status,views_count,applications_count,created_at,updated_at,submitted_by,requirements,benefits')
        .eq('status', 'approved')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) throw error
      setOpportunities(data || [])
      if (data && data.length) setCache("featured:v1", data, 120_000)
    } catch (error) {
      // Silently fail - fallback data will be shown
    } finally {
      setLoading(false)
    }
  }

  const fallbackData: Opportunity[] = [
    {
      id: 'fallback-1',
      title: 'Summer Internship Program',
      category: 'internship',
      deadline: new Date().toISOString(),
      location: 'Remote',
      organization: 'Tech Corp',
      description: 'Join our exciting summer internship program...',
      application_url: 'https://example.com',
      featured: true,
      status: 'approved',
      views_count: 100,
      applications_count: 25,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted_by: null,
      requirements: [],
      benefits: []
    },
    {
      id: 'fallback-2',
      title: 'Research Grant Opportunity',
      category: 'research',
      deadline: new Date().toISOString(),
      location: 'Multiple Locations',
      organization: 'Science Foundation',
      description: 'Research grants available for graduate students...',
      application_url: 'https://example.com',
      featured: true,
      status: 'approved',
      views_count: 75,
      applications_count: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted_by: null,
      requirements: [],
      benefits: []
    },
    {
      id: 'fallback-3',
      title: 'Scholarship Program',
      category: 'scholarship',
      deadline: new Date().toISOString(),
      location: 'Nationwide',
      organization: 'Education Fund',
      description: 'Full-ride scholarships available for undergraduates...',
      application_url: 'https://example.com',
      featured: true,
      status: 'approved',
      views_count: 150,
      applications_count: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted_by: null,
      requirements: [],
      benefits: []
    }
  ]

  const displayOpportunities = opportunities.length > 0 ? opportunities : fallbackData

  return (
    <section className="py-20 bg-background border-y border-border" id="opportunities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Opportunities</h2>
            <p className="text-muted-foreground">Hand-picked opportunities waiting for you</p>
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
              <div key={index} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 w-20 bg-muted rounded-full"></div>
                  <div className="h-4 w-12 bg-muted rounded"></div>
                </div>
                <div className="h-6 w-full bg-muted rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-16 w-full bg-muted rounded mb-4"></div>
                <div className="flex justify-between mb-6">
                  <div className="h-4 w-24 bg-muted rounded"></div>
                  <div className="h-4 w-20 bg-muted rounded"></div>
                </div>
                <div className="h-12 w-full bg-muted rounded"></div>
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