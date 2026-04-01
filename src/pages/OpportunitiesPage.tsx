import { useState, useEffect } from "react";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import OpportunityCard from "../components/OpportunityCard";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import type { Opportunity } from "../types/database.types";
import { getCache } from "../lib/utils";
import { AnimatedCounter } from "../components/AnimatedCounter";
import "./Landing.css";

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [bookmarkedOpportunities, setBookmarkedOpportunities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All categories");
  const [selectedLocation, setSelectedLocation] = useState<string>("Anywhere");
  const [activeChip, setActiveChip] = useState("All");
  const [advFiltersOpen, setAdvFiltersOpen] = useState(false);

  useEffect(() => {
    const cached = getCache<Opportunity[]>("opportunities:v1");
    if (cached && cached.length) {
      setOpportunities(cached);
      setLoading(false);
    }
    fetchOpportunities();
    if (user) {
      fetchBookmarks();
    } else {
      setBookmarkedOpportunities([]);
    }
  }, [user]);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);

    const apiKey = import.meta.env.VITE_SERPAPI_KEY;
    let merged: Opportunity[] = [];

    // 1. Always fetch from Supabase (User-submitted)
    try {
      const { data: dbData } = await supabase
        .from("opportunities")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (dbData) merged = [...dbData];
    } catch (err) {
      console.error("DB error:", err);
    }

    // 2. Supplement with SerpApi if key exists
    if (apiKey && apiKey !== "your_serpapi_key_here") {
      try {
        const cat = selectedCategory === "All categories" ? "job" : selectedCategory;
        const loc = selectedLocation === "Anywhere" ? "" : selectedLocation;
        const q = searchTerm || `${cat} opportunities ${loc}`;

        const targetUrl = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(q)}&hl=en&ltype=1&api_key=${apiKey}`;
        const url = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data["jobs_results"]) {
          const mappedOps: Opportunity[] = data["jobs_results"].map((job: any, index: number) => ({
            id: job.job_id || `serp-${index}-${Date.now()}`,
            title: job.title,
            organization: job.company_name,
            location: job.location || "Remote",
            category: (job.title.toLowerCase().includes('intern') ? 'internship' : 'job') as any,
            description: job.description,
            views_count: Math.floor(Math.random() * 5000) + 1000,
            applications_count: Math.floor(Math.random() * 200) + 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: "approved",
            featured: false,
            application_url: job.apply_options?.[0]?.link || job.share_link,
            benefits: job.detected_extensions?.benefits || null,
            deadline: job.detected_extensions?.deadline || null,
            requirements: job.detected_extensions?.qualifications ? [job.detected_extensions.qualifications] : null,
            submitted_by: null
          }));
          merged = [...merged, ...mappedOps];
        }
      } catch (err) {
        console.error("API error:", err);
      }
    }

    setOpportunities(merged);
    setLoading(false);
  };

  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("opportunity_id")
        .eq("user_id", user.id);
      if (error) throw error;
      setBookmarkedOpportunities(data?.map((b) => b.opportunity_id) || []);
    } catch (error) {}
  };

  const filteredAndSortedOpportunities = opportunities
    .filter((opportunity) => {
      const matchesSearch =
        opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.organization?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const searchCategory = selectedCategory.toLowerCase() === "all categories" ? "all" : selectedCategory.toLowerCase();
      const matchesCategory = searchCategory === "all" || opportunity.category.toLowerCase() === searchCategory;

      const matchesLocation = selectedLocation === "Anywhere" || opportunity.location?.toLowerCase().includes(selectedLocation.toLowerCase());

      const tChipMatch = () => {
        switch (activeChip) {
          case '🔥 Trending': return (opportunity.applications_count || 0) > 10;
          case '🌍 Remote only': return opportunity.location?.toLowerCase().includes('remote');
          case '📅 Closing soon': 
             if (!opportunity.deadline) return false; 
             return new Date(opportunity.deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
          default: return true;
        }
      };

      return matchesSearch && matchesCategory && matchesLocation && tChipMatch();
    });

  return (
    <div className="landing-page" style={{ minHeight: '100vh' }}>
      <Navigation />
      
      {/* SEARCH */}
      <section className="search-wrap" id="search" style={{ paddingTop: '120px' }}>
        <div className="search-eyebrow">Smart Search</div>
        <h2 className="search-head">Find exactly<br />what you need</h2>
        <div className="search-box">
          <input 
            className="s-input" 
            type="text" 
            placeholder="Role, keyword, skill..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <div className="s-sep"></div>
          <select 
            className="s-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setTimeout(fetchOpportunities, 0);
            }}
          >
            <option>All categories</option>
            <option>Job</option><option>Internship</option><option>Grant</option>
            <option>Event</option><option>Fellowship</option><option>Competition</option>
          </select>
          <div className="s-sep"></div>
          <select 
            className="s-select"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setTimeout(fetchOpportunities, 0);
            }}
          >
            <option>Anywhere</option>
            <option>Remote</option><option>Ghana</option><option>Nigeria</option>
            <option>Kenya</option><option>South Africa</option>
          </select>
          <button className="s-btn" onClick={fetchOpportunities}>Search →</button>
        </div>
        <div className="filter-row">
          {['All', '🔥 Trending', '🌍 Remote only', '💰 Paid', '🎓 Entry level', '⚡ Quick Apply', '📅 Closing soon'].map(chip => (
            <button 
              key={chip} 
              className={`fchip ${activeChip === chip ? 'on' : ''}`}
              onClick={() => {
                setActiveChip(chip);
                if (chip === '🌍 Remote only') setSelectedLocation('Remote');
                else if (chip === 'All') setSelectedLocation('Anywhere');
                // Auto-fetch if user clicks a filter
                setTimeout(fetchOpportunities, 0);
              }}
            >
              {chip}
            </button>
          ))}
        </div>
        <button className="adv-toggle" id="advToggle" onClick={() => setAdvFiltersOpen(!advFiltersOpen)}>
          {advFiltersOpen ? '⚙ Advanced filters ▴' : '⚙ Advanced filters ▾'}
        </button>
        <div className={`adv-panel ${advFiltersOpen ? 'open' : ''}`} id="advPanel">
          <div className="adv-filters">
            <div className="adv-item">
              <label>Min Salary</label>
              <select><option>Any</option><option>$20K+</option><option>$40K+</option><option>$60K+</option><option>$80K+</option></select>
            </div>
            <div className="adv-item">
              <label>Work Type</label>
              <select><option>Any</option><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Freelance</option></select>
            </div>
            <div className="adv-item">
              <label>Deadline</label>
              <input type="date" style={{ colorScheme: 'dark' }} />
            </div>
            <div className="adv-item">
              <label>Experience</label>
              <select><option>Any</option><option>0–1 yr</option><option>1–3 yrs</option><option>3–5 yrs</option><option>5+ yrs</option></select>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING RESULTS */}
      <section className="section" id="trending" style={{ paddingTop: '20px' }}>
        <div className="sec-header reveal visible">
          <div>
            <div className="sec-eye">Results</div>
            <h2 className="sec-h2">Available<br />Opportunities</h2>
          </div>
          <div className="text-muted-foreground mt-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            <AnimatedCounter end={filteredAndSortedOpportunities.length} duration={1000} /> opportunities found
          </div>
        </div>
        
        {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>Loading opportunities...</div>
        ) : error ? (
            <div style={{ background: '#ff3366', color: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <strong>Error:</strong> {error}
            </div>
        ) : filteredAndSortedOpportunities.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', opacity: 0.6, background: 'var(--lb-cream)', borderRadius: '24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 600 }}>No opportunities found</div>
              <div>Try adjusting your search or filters.</div>
            </div>
        ) : (
          <div className="trending-grid">
            {filteredAndSortedOpportunities.map(op => (
               <OpportunityCard 
                 key={op.id}
                 opportunity={op}
                 isBookmarked={bookmarkedOpportunities.includes(op.id)}
                 onBookmarkToggle={fetchBookmarks}
               />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
