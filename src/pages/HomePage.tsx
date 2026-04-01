import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";


import type { Opportunity } from "../types/database.types";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { AnimatedCounter } from "../components/AnimatedCounter";
import "./Landing.css";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trendingOps, setTrendingOps] = useState<Opportunity[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  // Sample data from SerpApi for preview/fallback
  const SAMPLE_SERP_JOBS: Opportunity[] = [
    {
      id: "serp-1",
      title: "Senior Full Stack Developer",
      organization: "TechFrontier Global",
      location: "Remote (Global)",
      category: "job",
      description: "Join our core platform team building high-scale fintech solutions. Experience with Node.js, TypeScript, and React required...",
      views_count: 5840,
      applications_count: 212,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "approved",
      featured: true,
      application_url: "#",
      benefits: ["Remote-first", "Stock options", "Health insurance"],
      deadline: "2025-06-30",
      requirements: ["5+ years React", "PostgreSQL", "Cloud experience"],
      submitted_by: null
    },
    {
      id: "serp-2",
      title: "Google Generation Scholarship",
      organization: "Google Education",
      location: "Worldwide",
      category: "scholarship",
      description: "Helping students in computer science reach their full potential. $10,000 award for the 2025-2026 academic year...",
      views_count: 8200,
      applications_count: 540,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "approved",
      featured: false,
      application_url: "#",
      benefits: ["$10,000 cash prize", "Mentorship", "Networking"],
      deadline: "2025-05-15",
      requirements: ["Undergraduate student", "Computer Science degree", "Academic excellence"],
      submitted_by: null
    },
    {
      id: "serp-3",
      title: "Product Management Fellow",
      organization: "Venture Studios",
      location: "Nairobi / Remote",
      category: "fellowship",
      description: "A 6-month intensive fellowship program for aspiring product leaders in emerging markets. Direct mentorship from YC founders...",
      views_count: 3400,
      applications_count: 145,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "approved",
      featured: false,
      application_url: "#",
      benefits: ["Stipend included", "Direct mentorship", "Founder access"],
      deadline: "2025-04-10",
      requirements: ["Entrepreneurial mindset", "Early-career professional", "Strong communication"],
      submitted_by: null
    }
  ];

  // Fetch trending opportunities from SerpApi (Website calling)
  useEffect(() => {
    const fetchTrending = async () => {
      setTrendingLoading(true);
      const apiKey = import.meta.env.VITE_SERPAPI_KEY;
      
      let allMerged: Opportunity[] = [];

      // 1. Fetch from Supabase (User-submitted)
      try {
        const { data: dbData } = await supabase
          .from("opportunities")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(6);
        if (dbData) allMerged = [...dbData];
      } catch (err) {
        console.error("DB error:", err);
      }

      // 2. Fetch from SerpApi (Global)
      if (apiKey && apiKey !== "your_serpapi_key_here") {
        try {
          const queries = ["Software Engineer Internship", "Graduate Program", "Tech Fellowships", "Entry Level Product Manager"];
          const query = queries[Math.floor(Math.random() * queries.length)];
          const targetUrl = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(query)}&hl=en&ltype=1&api_key=${apiKey}`;
          const url = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (data["jobs_results"]) {
            const mappedOps: Opportunity[] = data["jobs_results"].slice(0, 4).map((job: any, index: number) => ({
              id: job.job_id || `serp-home-${index}-${Date.now()}`,
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
            allMerged = [...allMerged, ...mappedOps];
          }
        } catch (error) {
          console.error("SerpApi error:", error);
        }
      }

      // If absolutely nothing found, use samples
      if (allMerged.length === 0) {
        setTrendingOps(SAMPLE_SERP_JOBS);
      } else {
        setTrendingOps(allMerged.slice(0, 8)); // Limit to 8 trending items on home
      }
      setTrendingLoading(false);
    };
    fetchTrending();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
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

  // Intersection Observer for scroll reveal animations
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 90);
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    
    reveals.forEach(el => ro.observe(el));
    
    return () => ro.disconnect();
  }, [trendingLoading, trendingOps]);

  // Intersection Observer for progress fill
  const progObjRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!progObjRef.current) return;
    const progObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && progObjRef.current) {
        progObjRef.current.style.width = '72%';
        progObs.disconnect();
      }
    });
    progObs.observe(progObjRef.current);
    return () => progObs.disconnect();
  }, []);

  // Intersection Observer for mini chart bars
  const barsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!barsRef.current) return;
    const bars = barsRef.current.querySelectorAll('.bar') as NodeListOf<HTMLElement>;
    const barObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        bars.forEach(b => {
          const h = b.style.height;
          b.style.height = '0';
          setTimeout(() => { b.style.height = h; }, 100);
        });
        barObs.disconnect();
      }
    });
    if (bars.length) barObs.observe(bars[0]);
    return () => barObs.disconnect();
  }, []);


  const TrendChip = ({ label }: { label: string }) => {
    const [active, setActive] = useState(false);
    return (
      <span 
        className={`trend-chip ${active ? 'active bg-[var(--lb-accent)] border-[var(--lb-accent)] text-white' : ''}`}
        onClick={() => setActive(!active)}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="landing-page">
      <Navigation />

      {/* HERO MOVED UP */}
      <section className="hero" style={{ minHeight: 'auto', paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="hero-blob"></div>
        <div>
          <div className="hero-tag"><span className="live-dot"></span> Open to everyone — not just students</div>
          <h1 className="hero-h1">Find your<br /><span className="serif">next big</span><br /><span className="outline">opportunity</span></h1>
          <p className="hero-sub">Jobs, grants, events, internships — curated and searchable in one place. Whether you're a student, professional, or entrepreneur, LeapBod has something for you.</p>
          <div className="hero-actions">
            <Link to="/opportunities" className="btn btn-accent btn-lg">Explore now →</Link>
            <Link to="/submit" className="btn btn-ghost btn-lg">Post a listing</Link>
          </div>
          <div className="hero-trust">
            <div className="trust-avatars">
              <span>👩🏾</span><span>👨🏿</span><span>👩🏻</span><span>👨🏽</span><span>👩🏼</span>
            </div>
            <div className="trust-text"><strong><AnimatedCounter end={24000} suffix="+" /></strong> people found opportunities this month</div>
          </div>
        </div>
        <div className="hero-right">
          <div className="feed-card fc-job">
            <div className="feed-ico">💼</div>
            <div className="feed-info">
              <div className="feed-title">Senior Product Designer — Paystack</div>
              <div className="feed-meta">Lagos · Full-time · $70K–$95K</div>
            </div>
            <span className="feed-pill pill-new">New</span>
          </div>
          <div className="feed-card fc-grant">
            <div className="feed-ico">💰</div>
            <div className="feed-info">
              <div className="feed-title">Tony Elumelu Entrepreneurship Grant</div>
              <div className="feed-meta">Pan-Africa · Up to $5,000</div>
            </div>
            <span className="feed-pill pill-hot">Trending</span>
          </div>
          <div className="feed-card fc-event">
            <div className="feed-ico">🎤</div>
            <div className="feed-info">
              <div className="feed-title">AfriTech Summit — Accra 2025</div>
              <div className="feed-meta">Apr 12 · Free entry · 800 spots</div>
            </div>
            <span className="feed-pill pill-open">Open</span>
          </div>
          <div className="feed-card fc-intern">
            <div className="feed-ico">🚀</div>
            <div className="feed-info">
              <div className="feed-title">Engineering Intern — Flutterwave</div>
              <div className="feed-meta">Remote · 6 months · Paid</div>
            </div>
            <span className="feed-pill pill-new">New</span>
          </div>
          <div className="trending-bar">
            <div>🔥 <strong>Trending now:</strong></div>
            <div className="trend-chips">
              <TrendChip label="AI roles" />
              <TrendChip label="Remote grants" />
              <TrendChip label="Fellowships" />
              <TrendChip label="Hackathons" />
            </div>
          </div>
        </div>
      </section>



      {/* TRENDING */}
      <section className="section" id="trending">
        <div className="sec-header reveal">
          <div>
            <div className="sec-eye">🔥 Most Applied This Week</div>
            <h2 className="sec-h2">Trending<br />Opportunities</h2>
          </div>
          <Link to="/opportunities" className="btn btn-ghost">View all →</Link>
        </div>
        <div className="trending-grid">
          {trendingLoading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="t-card" style={{ opacity: 0.5 }}>
                  <div className="t-rank">0{i+1}</div>
                  <div className="t-ico">...</div>
                  <div className="t-type">Loading...</div>
                  <div className="t-title">Loading Opportunity</div>
                </div>
             ))
          ) : trendingOps.map((op, i) => (
            <div key={op.id} className={`t-card reveal ${i === 0 ? 'featured' : ''}`}>
              <div className="t-rank">0{i + 1}</div>
              <div className="t-ico">{getCategoryIcon(op.category)}</div>
              <div className="t-type">{op.category} {op.featured ? "· Featured" : ""}</div>
              <div className="t-title">{op.title}</div>
              <div className="t-org">{op.organization || 'Organization'} · {op.location || 'Remote'}</div>
              <div className="t-stats">
                <div className="t-stat">👁 <span className="t-stat-val">{(op.views_count || 0).toLocaleString()}</span> views</div>
                <div className="t-stat">📨 <span className="t-stat-val">{(op.applications_count || 0).toLocaleString()}</span> applied</div>
              </div>
              <div className="t-foot">
                <span className="t-deadline">
                  {op.deadline ? `Closes ${new Date(op.deadline).toLocaleDateString()}` : 'Open'}
                </span>
                <button className="t-apply" onClick={() => navigate('/opportunities')}>→</button>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* COMMUNITY */}
      <section className="community-section" id="community">
        <div className="sec-header reveal">
          <div>
            <div className="sec-eye">Community</div>
            <h2 className="sec-h2">Forums &<br />Mentorship</h2>
          </div>
          <a href="#community" className="btn btn-ghost">Browse all →</a>
        </div>
        <div className="community-grid">
          <div className="forum-list reveal">
            <div className="forum-card">
              <div className="forum-ico fi-jobs">💼</div>
              <div className="forum-info">
                <div className="forum-name">Jobs & Careers</div>
                <div className="forum-sub">Salary advice, interview tips, career pivots</div>
              </div>
              <div className="forum-count"><div className="fc-num">3.2K</div><div className="fc-label">posts</div></div>
            </div>
            <div className="forum-card">
              <div className="forum-ico fi-grants">💰</div>
              <div className="forum-info">
                <div className="forum-name">Grants & Funding</div>
                <div className="forum-sub">Application tips, success stories, deadlines</div>
              </div>
              <div className="forum-count"><div className="fc-num">1.8K</div><div className="fc-label">posts</div></div>
            </div>
            <div className="forum-card">
              <div className="forum-ico fi-events">🎤</div>
              <div className="forum-info">
                <div className="forum-name">Events & Networking</div>
                <div className="forum-sub">Upcoming meetups, hackathons, summits</div>
              </div>
              <div className="forum-count"><div className="fc-num">940</div><div className="fc-label">posts</div></div>
            </div>
            <div className="forum-card">
              <div className="forum-ico fi-career">🚀</div>
              <div className="forum-info">
                <div className="forum-name">Career Development</div>
                <div className="forum-sub">Skills, certifications, growth stories</div>
              </div>
              <div className="forum-count"><div className="fc-num">2.1K</div><div className="fc-label">posts</div></div>
            </div>
          </div>

          <div className="mentorship-card reveal">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 700, marginBottom: '16px', color: 'var(--lb-accent)', textTransform: 'uppercase', letterSpacing: '2px' }}>Featured Mentors</h3>
            <div className="mc-title">Connect with<br />experienced pros</div>
            <div className="mc-sub">Get matched with a mentor who's been where you're going. 1-on-1 guidance, real talk, real results.</div>
            <div className="mentor-list">
              <div className="mentor-item">
                <div className="m-avatar">👨🏿</div>
                <div className="m-info">
                  <div className="m-name">Kwame Mensah</div>
                  <div className="m-role">Product Lead @ Flutterwave</div>
                </div>
                <button className="m-btn">Request →</button>
              </div>
              <div className="mentor-item">
                <div className="m-avatar">👩🏾</div>
                <div className="m-info">
                  <div className="m-name">Fatima Al-Hassan</div>
                  <div className="m-role">ML Engineer @ Google</div>
                </div>
                <button className="m-btn">Request →</button>
              </div>
              <div className="mentor-item">
                <div className="m-avatar">👨🏽</div>
                <div className="m-info">
                  <div className="m-name">Tunde Okafor</div>
                  <div className="m-role">Founder, 3x Exited</div>
                </div>
                <button className="m-btn">Request →</button>
              </div>
            </div>
            <button 
              onClick={() => window.open("https://micromentor.org/?gad_source=1&gbraid=0AAAAAD_K8ZtJSnQdFhDwgEikR8LH5fOIn", "_blank")}
              className="btn btn-accent" 
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Find my mentor →
            </button>
          </div>
        </div>
      </section>

      {/* PROFESSIONAL PLATFORM SECTION */}
      <section className="referral-section" id="referral" style={{ paddingBottom: '100px' }}>
        <div className="sec-header reveal" style={{ maxWidth: '1200px', margin: '0 auto 48px', padding: '0 52px' }}>
          <div>
            <div className="sec-eye">Infrastructure</div>
            <h2 className="sec-h2">Professional<br />Platform</h2>
          </div>
        </div>
        <div className="ref-inner reveal">
          <div>
            <div className="ref-eye">Smart Matching</div>
            <h2 className="ref-title">Precision engineered<br />for your potential.</h2>
            <p className="ref-sub">Our platform uses advanced algorithms to pair your unique skills with opportunities that actually matter. No more noise, just your next leap.</p>
            <div className="ref-steps" style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="ref-step" style={{ background: 'var(--lb-paper)', padding: '20px', borderRadius: '16px', border: '1px solid var(--lb-border)' }}>
                <div className="rs-num" style={{ background: 'var(--lb-ink)', color: 'var(--lb-paper)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>01</div>
                <div className="rs-text" style={{ fontSize: '15px', color: 'var(--lb-ink)' }}><strong>Vector-Based Matching</strong> — We analyze deeper than keywords to understand your career trajectory and technical fit.</div>
              </div>
              <div className="ref-step" style={{ background: 'var(--lb-paper)', padding: '20px', borderRadius: '16px', border: '1px solid var(--lb-border)' }}>
                <div className="rs-num" style={{ background: 'var(--lb-accent)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>02</div>
                <div className="rs-text" style={{ fontSize: '15px', color: 'var(--lb-ink)' }}><strong>Unified Ecosystem</strong> — Every application status and save is tracked in one clear, real-time dashboard.</div>
              </div>
              <div className="ref-step" style={{ background: 'var(--lb-paper)', padding: '20px', borderRadius: '16px', border: '1px solid var(--lb-border)' }}>
                <div className="rs-num" style={{ background: 'var(--lb-ink)', color: 'var(--lb-paper)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>03</div>
                <div className="rs-text" style={{ fontSize: '15px', color: 'var(--lb-ink)' }}><strong>Vetted Integrity</strong> — Every organization on LeapBod is verified for transparency, impact, and growth potential.</div>
              </div>
            </div>
          </div>
          <div className="ref-box-side" style={{ position: 'relative' }}>
             <div className="ref-box-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--lb-accent)', marginBottom: '12px' }}>
                  <span className="live-dot" style={{ width: '8px', height: '8px' }}></span> Real-time Network
                </div>
                <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '8px' }}>Active Talent Pool</div>
                <h3 style={{ fontSize: '48px', fontFamily: 'Syne, sans-serif', margin: '0 0 8px 0', letterSpacing: '-2px' }}><AnimatedCounter end={18500} suffix="+" /></h3>
                <p style={{ opacity: 0.7, fontSize: '14px', margin: 0 }}>Verified professionals across 12 countries.</p>
             </div>
             <div className="ref-stats-box" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                   <span>Global Matching Accuracy</span>
                   <span style={{ color: 'var(--lb-accent)', fontWeight: '600' }}>94%</span>
                </div>
                <div className="ref-progress-wrap" style={{ background: 'rgba(255,255,255,0.1)' }}>
                   <div className="ref-progress-fill" style={{ width: '94%', boxShadow: '0 0 20px var(--lb-accent)' }}></div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>820+</div>
                    <div style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase' }}>Daily Matches</div>
                  </div>
                  <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '20px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>14m+</div>
                    <div style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase' }}>Data Points</div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* EMPLOYER DASHBOARD */}
      <section className="employer-section" id="employers">
        <div className="sec-header reveal">
          <div>
            <div className="sec-eye">For Employers & Organizers</div>
            <h2 className="sec-h2">Amplify your reach &<br />drive global talent</h2>
          </div>
          <Link to="/submit" className="btn btn-accent">Post a listing →</Link>
        </div>
        <div className="employer-grid">
          <div className="emp-dash reveal" style={{ background: 'var(--lb-ink)', color: 'var(--lb-paper)' }}>
            <div className="ed-title" style={{ color: 'var(--lb-paper)' }}>🌍 Global Talent Network</div>
            <div className="analytics-row" style={{ marginTop: '20px' }}>
              <div className="ana-box" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="ana-val" style={{ color: '#fff' }}><AnimatedCounter end={120} />k+</div>
                <div className="ana-label" style={{ color: 'rgba(246,243,238,0.6)' }}>Active Members</div>
              </div>
              <div className="ana-box" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="ana-val" style={{ color: '#fff' }}>45+</div>
                <div className="ana-label" style={{ color: 'rgba(246,243,238,0.6)' }}>Countries</div>
              </div>
              <div className="ana-box" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="ana-val" style={{ color: '#fff' }}>68%</div>
                <div className="ana-label" style={{ color: 'rgba(246,243,238,0.6)' }}>Senior/Mid-Level</div>
              </div>
              <div className="ana-box" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="ana-val" style={{ color: '#fff' }}>8.5k</div>
                <div className="ana-label" style={{ color: 'rgba(246,243,238,0.6)' }}>Daily Visitors</div>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '12px', color: 'rgba(246,243,238,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Network Demographics</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: '#fff' }}>
                    <span>Software Engineering</span>
                    <span style={{ color: 'var(--lb-accent)' }}>42%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '42%', height: '100%', background: 'var(--lb-accent)', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: '#fff' }}>
                    <span>Product & Design</span>
                    <span style={{ color: 'var(--lb-blue)' }}>28%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '28%', height: '100%', background: 'var(--lb-blue)', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: '#fff' }}>
                    <span>Marketing & Growth</span>
                    <span style={{ color: 'var(--lb-purple)' }}>18%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '18%', height: '100%', background: 'var(--lb-purple)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '24px', fontSize: '14px', lineHeight: '1.6', color: 'rgba(246,243,238,0.8)' }}>
              Stop waiting for candidates to find you. Put your brand directly in front of the fastest-growing professional network.
            </div>
          </div>

          <div className="emp-listings reveal" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="listing-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <div style={{ minWidth: '48px', height: '48px', borderRadius: '12px', background: 'rgba(232,93,38,0.1)', color: 'var(--lb-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎯</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '18px' }}>Smart Targeting</div>
                  <div style={{ fontSize: '14px', color: 'var(--lb-muted)' }}>Reach the exact audience you need</div>
                </div>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--lb-muted)', lineHeight: '1.5' }}>
                Match your opportunities with candidates based on strict criteria: skills, geographic location, experience level, and industry tags. 
              </div>
            </div>

            <div className="listing-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <div style={{ minWidth: '48px', height: '48px', borderRadius: '12px', background: 'rgba(26,79,214,0.1)', color: 'var(--lb-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🚀</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '18px' }}>Omnichannel Promotion</div>
                  <div style={{ fontSize: '14px', color: 'var(--lb-muted)' }}>Beyond the talent feed</div>
                </div>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--lb-muted)', lineHeight: '1.5' }}>
                Every premium listing is automatically syndicated to our weekly curated newsletter and pushed dynamically across our official social channels.
              </div>
            </div>

            <div className="listing-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <div style={{ minWidth: '48px', height: '48px', borderRadius: '12px', background: 'rgba(26,122,74,0.1)', color: 'var(--lb-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>✨</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '18px' }}>Employer Branding</div>
                  <div style={{ fontSize: '14px', color: 'var(--lb-muted)' }}>Stand out from the crowd</div>
                </div>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--lb-muted)', lineHeight: '1.5' }}>
                Create a stunning company page. Highlight your culture, showcase employee testimonials, and build long-term brand loyalty.
              </div>
            </div>

            <button className="post-btn" onClick={() => navigate('/submit')} style={{ marginTop: 'auto' }}>Engage top talent today</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-bg-text">LEAPBOD</div>
        <div className="cta-eye">Your next chapter</div>
        <h2 className="cta-h2">Ready to<br /><em>leap forward?</em></h2>
        <p className="cta-sub">Join 24,000+ people who found jobs, grants, and opportunities on LeapBod — free forever.</p>
        <div className="cta-btns">
          {!user ? (
            <Link to="/auth/login" className="btn btn-paper btn-lg">Create free account →</Link>
          ) : (
            <Link to="/dashboard" className="btn btn-paper btn-lg">Go to Dashboard →</Link>
          )}
          <Link to="/submit" className="btn btn-out btn-lg">Post an opportunity</Link>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
