import { useState } from "react";
import { HiBookmark, HiOutlineBookmark, HiExternalLink } from "react-icons/hi";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import type { Opportunity } from "../types/database.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";


interface OpportunityCardProps {
  opportunity: Opportunity;
  onBookmarkToggle?: () => void;
  isBookmarked?: boolean;
  showBookmark?: boolean;
}

export default function OpportunityCard({
  opportunity,
  onBookmarkToggle,
  isBookmarked = false,
  showBookmark = true,
}: OpportunityCardProps) {
  const { user } = useAuth();
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "job": return "🏢";
      case "scholarship":
      case "grant": return "💰";
      case "event": return "🎪";
      case "internship": return "🚀";
      case "fellowship": return "🔬";
      case "competition": return "💡";
      case "research": return "🧪";
      default: return "🌟";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Open";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleBookmarkToggle = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) {
      alert("Please log in to bookmark opportunities.");
      return;
    }
    if (isBookmarkLoading) return;

    setIsBookmarkLoading(true);
    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("opportunity_id", opportunity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bookmarks")
          .insert({ user_id: user.id, opportunity_id: opportunity.id });
        if (error) throw error;
      }
      onBookmarkToggle?.();
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert("Failed to update bookmark. Please try again.");
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const isDeadlinePassed = () => {
    if (!opportunity.deadline) return false;
    return new Date(opportunity.deadline) < new Date();
  };

  return (
    <>
      <div className={`t-card ${opportunity.featured ? 'featured' : ''} reveal visible`} onClick={() => setShowDetailsDialog(true)} style={{ position: 'relative', cursor: 'pointer' }}>
        
        {showBookmark && user && (
          <button
            onClick={handleBookmarkToggle}
            disabled={isBookmarkLoading}
            style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10, background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
          >
            {isBookmarked ? (
              <HiBookmark style={{width: '24px', height: '24px', color: 'var(--lb-blue)'}} />
            ) : (
              <HiOutlineBookmark style={{width: '24px', height: '24px', color: 'var(--lb-muted)'}} />
            )}
          </button>
        )}

        <div className="t-ico">{getCategoryIcon(opportunity.category)}</div>
        <div className="t-type" style={{ paddingRight: '40px' }}>
          {opportunity.category} {opportunity.featured ? '· Featured' : ''}
        </div>
        <div className="t-title">{opportunity.title}</div>
        <div className="t-org">{opportunity.organization || 'Independent'} · {opportunity.location || 'Remote'}</div>
        
        <div className="t-stats">
          <div className="t-stat">👁 <span className="t-stat-val">{(opportunity.views_count || 0).toLocaleString()}</span> views</div>
          <div className="t-stat">📨 <span className="t-stat-val">{(opportunity.applications_count || 0).toLocaleString()}</span> applied</div>
        </div>
        
        <div className="t-foot">
          <span className="t-deadline" style={isDeadlinePassed() ? { color: '#ff3366' } : {}}>
            {isDeadlinePassed() ? "Expired" : "Closes " + formatDate(opportunity.deadline)}
          </span>
          <button className="t-apply" onClick={(e) => { e.stopPropagation(); setShowDetailsDialog(true); }}>→</button>
        </div>
      </div>

      {/* Details Dialog from existing codebase, styled mostly as is but cleaner */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl" style={{ 
          borderRadius: '16px', 
          border: '1px solid var(--lb-border)',
          background: 'var(--lb-paper)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{opportunity.title}</DialogTitle>
            </div>
            {opportunity.organization && (
              <DialogDescription className="text-lg font-medium" style={{ color: 'var(--lb-muted)' }}>
                {opportunity.organization}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto pr-2" style={{ maxHeight: '60vh', marginTop: '16px' }}>
            <div>
              <h4 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Description</h4>
              <p className="whitespace-pre-wrap" style={{ color: 'var(--lb-ink)' }}>{opportunity.description}</p>
            </div>

            {opportunity.requirements && opportunity.requirements.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Requirements</h4>
                <ul className="list-disc list-inside space-y-1">
                  {opportunity.requirements.map((req, index) => (
                    <li key={index} style={{ color: 'var(--lb-ink)' }}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {opportunity.benefits && opportunity.benefits.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Benefits</h4>
                <ul className="list-disc list-inside space-y-1">
                  {opportunity.benefits.map((benefit, index) => (
                    <li key={index} style={{ color: 'var(--lb-ink)' }}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4" style={{ padding: '16px', background: 'var(--lb-cream)', borderRadius: '12px' }}>
              <div>
                <h4 className="font-medium" style={{ color: 'var(--lb-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Location</h4>
                <p style={{ fontWeight: 500 }}>{opportunity.location || "Not specified"}</p>
              </div>
              <div>
                <h4 className="font-medium" style={{ color: 'var(--lb-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Deadline</h4>
                <p style={{ fontWeight: 500, color: isDeadlinePassed() ? '#ff3366' : 'var(--lb-ink)' }}>
                  {formatDate(opportunity.deadline)} {isDeadlinePassed() && " (Expired)"}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between" style={{ marginTop: '24px' }}>
            <div className="flex items-center gap-2">
            </div>
            {opportunity.application_url && !isDeadlinePassed() && (
              <button
                className="btn btn-dark"
                onClick={() => window.open(opportunity.application_url!, "_blank")}
              >
                Apply Now <HiExternalLink className="ml-2" />
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
