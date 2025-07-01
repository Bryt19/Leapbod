import { useState } from 'react'
import { HiCalendar, HiLocationMarker, HiBookmark, HiOutlineBookmark, HiExternalLink, HiStar } from 'react-icons/hi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Opportunity } from '../types/database.types'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'

interface OpportunityCardProps {
  opportunity: Opportunity
  onBookmarkToggle?: () => void
  isBookmarked?: boolean
  showBookmark?: boolean
}

export default function OpportunityCard({ 
  opportunity, 
  onBookmarkToggle, 
  isBookmarked = false, 
  showBookmark = true 
}: OpportunityCardProps) {
  const { user } = useAuth()
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const getCategoryColor = (category: string) => {
    const colors = {
      internship: 'bg-blue-100 text-blue-800',
      scholarship: 'bg-green-100 text-green-800',
      competition: 'bg-purple-100 text-purple-800',
      event: 'bg-orange-100 text-orange-800',
      job: 'bg-indigo-100 text-indigo-800',
      research: 'bg-teal-100 text-teal-800'
    }
    return colors[category as keyof typeof colors] || colors.internship
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const handleBookmarkToggle = async () => {
    if (!user || isBookmarkLoading) return
    
    setIsBookmarkLoading(true)
    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('opportunity_id', opportunity.id)
      } else {
        await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            opportunity_id: opportunity.id
          })
      }
      onBookmarkToggle?.()
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    } finally {
      setIsBookmarkLoading(false)
    }
  }

  const isDeadlinePassed = () => {
    if (!opportunity.deadline) return false
    const deadline = new Date(opportunity.deadline)
    const now = new Date()
    return deadline < now
  }

  // Calculate a simple rating based on views and applications
  const calculateRating = () => {
    const views = opportunity.views_count || 0
    const applications = opportunity.applications_count || 0
    const base = 4.0
    const bonus = Math.min((views / 100) * 0.3 + (applications / 10) * 0.2, 1.0)
    return Math.min(base + bonus, 5.0).toFixed(1)
  }

  const handleViewDetails = () => {
    setShowDetailsDialog(true)
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative h-full flex flex-col">
        {/* Bookmark button */}
        {showBookmark && user && (
          <button
            onClick={handleBookmarkToggle}
            disabled={isBookmarkLoading}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            {isBookmarked ? (
              <HiBookmark className="w-5 h-5 text-blue-600" />
            ) : (
              <HiOutlineBookmark className="w-5 h-5 text-gray-400 hover:text-blue-600" />
            )}
          </button>
        )}

        {/* Category and Rating */}
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(opportunity.category)} capitalize`}>
            {opportunity.category}
          </span>
          <div className="flex items-center">
            <HiStar className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{calculateRating()}</span>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {opportunity.title}
        </h3>

        {/* Organization */}
        {opportunity.organization && (
          <p className="text-sm text-gray-500 mb-2 font-medium">{opportunity.organization}</p>
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{opportunity.description}</p>
        
        {/* Date and Location */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="flex items-center">
            <HiCalendar className="w-4 h-4 mr-1" />
            <span className={isDeadlinePassed() ? 'text-red-500 font-medium' : ''}>
              {formatDate(opportunity.deadline)}
              {isDeadlinePassed() && ' (Expired)'}
            </span>
          </div>
          {opportunity.location && (
            <div className="flex items-center">
              <HiLocationMarker className="w-4 h-4 mr-1" />
              {opportunity.location}
            </div>
          )}
        </div>
        
        {/* View Details Button */}
        <Button
          onClick={handleViewDetails}
          className={`w-full mt-auto ${
            isDeadlinePassed() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isDeadlinePassed()}
        >
          {isDeadlinePassed() ? 'Expired' : 'View Details'}
        </Button>

        {/* Featured badge */}
        {opportunity.featured && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              ⭐ Featured
            </div>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl">{opportunity.title}</DialogTitle>
              <Badge className={`${getCategoryColor(opportunity.category)} capitalize`}>
                {opportunity.category}
              </Badge>
            </div>
            {opportunity.organization && (
              <DialogDescription className="text-lg font-medium">
                {opportunity.organization}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-6">
            {/* Description */}
            <div>
              <h4 className="text-lg font-semibold mb-2">Description</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{opportunity.description}</p>
            </div>

            {/* Requirements */}
            {opportunity.requirements && opportunity.requirements.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-2">Requirements</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {opportunity.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {opportunity.benefits && opportunity.benefits.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-2">Benefits</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {opportunity.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            {/* Meta Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-500">Location</h4>
                <p>{opportunity.location || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-500">Deadline</h4>
                <p className={isDeadlinePassed() ? 'text-red-500 font-medium' : ''}>
                  {formatDate(opportunity.deadline)}
                  {isDeadlinePassed() && ' (Expired)'}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <div className="flex items-center gap-2">
              {showBookmark && user && (
                <Button
                  variant="outline"
                  onClick={handleBookmarkToggle}
                  disabled={isBookmarkLoading}
                >
                  {isBookmarked ? (
                    <>
                      <HiBookmark className="w-4 h-4 mr-2" />
                      Bookmarked
                    </>
                  ) : (
                    <>
                      <HiOutlineBookmark className="w-4 h-4 mr-2" />
                      Bookmark
                    </>
                  )}
                </Button>
              )}
            </div>
            {opportunity.application_url && !isDeadlinePassed() && (
              <Button
                onClick={() => {
                  if (opportunity.application_url) {
                    window.open(opportunity.application_url, '_blank')
                  }
                }}
                className="sm:w-auto"
              >
                Apply Now
                <HiExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 