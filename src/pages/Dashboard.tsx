import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import type { Opportunity } from "../types/database.types";
import { getCache, setCache, dedupeRequest } from "../lib/utils";
import Footer from "../components/Footer";
import "./Landing.css";

interface BookmarkWithOpportunity {
  opportunity_id: string;
  opportunities: Opportunity;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [submittedOpportunities, setSubmittedOpportunities] = useState<Opportunity[]>([]);
  const [bookmarkedOpportunities, setBookmarkedOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showSuccess = searchParams.get("submitted") === "true";

  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    if (user) {
      const subKey = `dash:${user.id}:submitted:v1`;
      const bmKey = `dash:${user.id}:bookmarks:v1`;
      const cachedSubmitted = getCache<Opportunity[]>(subKey);
      const cachedBookmarks = getCache<Opportunity[]>(bmKey);
      if ((cachedSubmitted && cachedSubmitted.length) || (cachedBookmarks && cachedBookmarks.length)) {
        if (cachedSubmitted) setSubmittedOpportunities(cachedSubmitted);
        if (cachedBookmarks) setBookmarkedOpportunities(cachedBookmarks);
        setLoading(false);
      }
      fetchUserData();
    } else if (!authLoading) {
      setLoading(false);
    }

    if (showSuccess) {
      const timer = setTimeout(() => setSearchParams({}), 5000);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, showSuccess, setSearchParams]);

  const fetchUserData = async () => {
    const subKey = `dash:${user?.id}:submitted:v1`;
    const bmKey = `dash:${user?.id}:bookmarks:v1`;
    const hasCache = getCache<Opportunity[]>(subKey) || getCache<Opportunity[]>(bmKey);
    if (!hasCache || (!getCache<Opportunity[]>(subKey)?.length && !getCache<Opportunity[]>(bmKey)?.length)) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await dedupeRequest(`fetch-dashboard-${user?.id}`, async () => {
        const [submittedRes, bookmarksRes] = await Promise.all([
          supabase
            .from("opportunities")
            .select("id,title,description,category,organization,status,created_at,views_count,applications_count,deadline")
            .eq("submitted_by", user?.id as string)
            .order("created_at", { ascending: false }),
          supabase
            .from("bookmarks")
            .select(`opportunity_id, opportunities (id,title,description,category,organization,deadline)`)
            .eq("user_id", user?.id as string),
        ]);

        if (submittedRes.error) throw submittedRes.error;
        if (bookmarksRes.error) throw bookmarksRes.error;

        const bookmarkedOppsList = (bookmarksRes.data as BookmarkWithOpportunity[])?.map((b) => b.opportunities).filter(Boolean) || [];
        return { submitted: submittedRes.data || [], bookmarked: bookmarkedOppsList };
      });

      setSubmittedOpportunities(data.submitted as Opportunity[]);
      if (user?.id) setCache(`dash:${user.id}:submitted:v1`, data.submitted, 3600_000);
      setBookmarkedOpportunities(data.bookmarked as Opportunity[]);
      if (user?.id) setCache(`dash:${user.id}:bookmarks:v1`, data.bookmarked, 3600_000);
    } catch (error) {
      setError("Failed to load dashboard data. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

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

  if (authLoading) {
    return (
      <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--lb-paper)' }}>
        <Navigation />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>Loading session...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--lb-paper)' }}>
        <Navigation />
        <div className="cta-section" style={{ margin: '60px auto', borderRadius: '24px', maxWidth: '800px' }}>
          <h2 className="cta-h2">Access Denied</h2>
          <p className="cta-sub">Please log in to view your dashboard.</p>
          <div className="cta-btns">
            <Link to="/auth/login" className="btn btn-paper btn-lg">Log in</Link>
          </div>
        </div>
      </div>
    );
  }

  const viewsTotal = submittedOpportunities.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
  const appsTotal = submittedOpportunities.reduce((acc, curr) => acc + (curr.applications_count || 0), 0);
  const pendingCount = submittedOpportunities.filter((o) => o.status === "pending").length;

  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--lb-paper)' }}>
      <Navigation />

      <div className="dashboard-main-content">
        
        {showSuccess && (
          <div style={{ background: 'var(--lb-green)', color: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <strong>🎉 Success!</strong> Your opportunity has been submitted for review.
          </div>
        )}

        {error && (
          <div style={{ background: '#ff3366', color: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <strong>Error:</strong> {error} <button onClick={fetchUserData} style={{textDecoration: 'underline', marginLeft: '12px'}}>Try again</button>
          </div>
        )}

        {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>Loading dashboard...</div>
        ) : (
          <>
            {/* EMPLOYER SECTION */}
            <section className="employer-section" style={{ padding: 0 }} id="employers">
              <div className="sec-header reveal visible">
                <div>
                  <div className="sec-eye">Dashboard</div>
                  <h2 className="sec-h2">Your Submissions<br />& Analytics</h2>
                </div>
                <Link to="/submit" className="btn btn-accent">Post new listing →</Link>
              </div>

              <div className="employer-grid">
                <div className="emp-dash reveal visible">
                  <div className="ed-title">📊 Analytics Dashboard</div>
                  <div className="analytics-row">
                    <div className="ana-box">
                      <div className="ana-val">{viewsTotal.toLocaleString()}</div>
                      <div className="ana-label">Total views</div>
                    </div>
                    <div className="ana-box">
                      <div className="ana-val">{appsTotal.toLocaleString()}</div>
                      <div className="ana-label">Applications</div>
                    </div>
                    <div className="ana-box">
                      <div className="ana-val">{submittedOpportunities.length}</div>
                      <div className="ana-label">Total Listings</div>
                    </div>
                    <div className="ana-box">
                      <div className="ana-val">{pendingCount}</div>
                      <div className="ana-label">Pending Review</div>
                    </div>
                  </div>
                </div>

                <div className="emp-listings reveal visible">
                  {submittedOpportunities.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
                        <div>No submissions yet. Share opportunities with the community!</div>
                      </div>
                  ) : (
                    submittedOpportunities.map(op => (
                      <div className="listing-card" key={op.id}>
                        <div className="lc-top">
                          <div>
                            <div className="lc-title">{op.title}</div>
                            <div className="lc-meta">{op.category} · {op.organization || 'Independent'} · {new Date(op.created_at || '').toLocaleDateString()}</div>
                          </div>
                          <span className={`lc-status ${op.status === 'approved' ? 'lc-active' : op.status === 'rejected' ? 'lc-paused' : ''}`} style={op.status === 'pending' ? { background: 'rgba(232, 93, 38, 0.1)', color: 'var(--lb-accent)' } : {}}>
                            {op.status === 'approved' ? 'Active' : op.status === 'pending' ? 'Pending' : 'Rejected'}
                          </span>
                        </div>
                        <div className="lc-stats">
                          <div className="lc-stat">👁 <span>{op.views_count || 0}</span> views</div>
                          <div className="lc-stat">📨 <span>{op.applications_count || 0}</span> applied</div>
                        </div>
                      </div>
                    ))
                  )}
                  {submittedOpportunities.length > 0 && <button className="post-btn" onClick={() => window.location.href='/submit'}>＋ Post a new listing</button>}
                </div>
              </div>
            </section>

            <div style={{ height: '60px' }}></div>

            {/* TRACKER SECTION (Bookmarks) */}
            <section className="profile-section" style={{ padding: 0 }} id="tracker">
              <div className="sec-header reveal visible">
                <div>
                  <div className="sec-eye">Saved Items</div>
                  <h2 className="sec-h2">Your Bookmarks<br />& Tracker</h2>
                </div>
                <Link to="/opportunities" className="btn btn-ghost">Browse all →</Link>
              </div>

              <div className="tracker-card reveal visible" style={{ height: 'auto', minHeight: '400px', gridColumn: '1 / -1' }}>
                <div className="tracker-head">
                  <div className="tracker-title">Application Tracker</div>
                  <div className="tracker-tabs">
                    {['All', 'Active', 'Saved'].map(tab => (
                      <button 
                        key={tab} 
                        className={`tab ${activeTab === tab ? 'on' : ''}`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="app-list">
                  {bookmarkedOpportunities.length === 0 ? (
                      <div style={{ padding: '60px', textAlign: 'center', opacity: 0.6 }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔖</div>
                        <div>No bookmarks yet. Start exploring to save items for later!</div>
                      </div>
                  ) : bookmarkedOpportunities.map(op => (
                    <div className="app-item" key={op.id}>
                      <div className="app-logo">{getCategoryIcon(op.category)}</div>
                      <div className="app-info">
                        <div className="app-title">{op.title}</div>
                        <div className="app-co">{op.organization || 'Organization'}</div>
                      </div>
                      <span className="app-status st-saved">Saved</span>
                    </div>
                  ))}
                </div>
                <div className="tracker-foot">
                  <div className="t-stat-box"><div className="tsb-num">{bookmarkedOpportunities.length}</div><div className="tsb-label">Total Saved</div></div>
                </div>
              </div>
            </section>

          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
