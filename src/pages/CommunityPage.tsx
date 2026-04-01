import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { supabase } from "../lib/supabase";
import "./Landing.css";
import { HiUsers, HiChatAlt2, HiLightningBolt, HiAcademicCap } from "react-icons/hi";

export default function CommunityPage() {
  const [stats, setStats] = useState({ members: 4200, opportunities: 148, cities: 12 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: opCount } = await supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'approved');
        
        setStats({ 
          members: Math.max(4200, (userCount || 0) + 4200),
          opportunities: Math.max(148, (opCount || 0) + 148),
          cities: 14
        });
      } catch (e) {
        console.error("Stats fetch error:", e);
        // Fallback to defaults already in state
      }
    }
    fetchStats();

    // Intersection Observer for scroll reveal animations
    const reveals = document.querySelectorAll('.reveal');
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 100);
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => ro.observe(el));
    return () => ro.disconnect();
  }, []);

  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--lb-paper)' }}>
      <Navigation />

      {/* HERO SECTION */}
      <section className="hero" style={{ paddingTop: '140px', paddingBottom: '80px', minHeight: 'auto' }}>
        <div className="hero-blob"></div>
        <div style={{ maxWidth: '800px' }}>
          <div className="hero-tag"><span className="live-dot"></span> <AnimatedCounter end={stats.members} suffix="+" /> active members</div>
          <h1 className="hero-h1">Collective<br /><span className="serif">Growth</span> <span className="outline">& Power</span></h1>
          <p className="hero-sub">LeapBod isn't just a platform; it's a movement. Connect with peers, find mentors, and participate in exclusive workshops designed to accelerate your career.</p>
          <div className="hero-actions">
            <button className="btn btn-accent btn-lg" onClick={() => window.open("https://www.skillsyouneed.com/", "_blank")}>Join the Forum →</button>
            <button className="btn btn-ghost btn-lg" onClick={() => window.open("https://micromentor.org/?gad_source=1&gbraid=0AAAAAD_K8ZtJSnQdFhDwgEikR8LH5fOIn", "_blank")}>Find a Mentor</button>
          </div>
        </div>
      </section>

      {/* COMMUNITY STATS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="analytics-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="ana-box reveal" style={{ background: 'var(--lb-cream)', border: '1px solid var(--lb-border)', color: 'var(--lb-ink)' }}>
            <div className="ana-val"><AnimatedCounter end={stats.members} suffix="+" /></div>
            <div className="ana-label" style={{ color: 'var(--lb-muted)' }}>Tribe Members</div>
          </div>
          <div className="ana-box reveal" style={{ background: 'var(--lb-cream)', border: '1px solid var(--lb-border)', color: 'var(--lb-ink)' }}>
            <div className="ana-val"><AnimatedCounter end={stats.members * 12} suffix="+" /></div>
            <div className="ana-label" style={{ color: 'var(--lb-muted)' }}>Monthly Views</div>
          </div>
          <div className="ana-box reveal" style={{ background: 'var(--lb-cream)', border: '1px solid var(--lb-border)', color: 'var(--lb-ink)' }}>
            <div className="ana-val"><AnimatedCounter end={stats.opportunities} suffix="+" /></div>
            <div className="ana-label" style={{ color: 'var(--lb-muted)' }}>Opportunities</div>
          </div>
          <div className="ana-box reveal" style={{ background: 'var(--lb-cream)', border: '1px solid var(--lb-border)', color: 'var(--lb-ink)' }}>
            <div className="ana-val"><AnimatedCounter end={stats.cities} suffix="+" /></div>
            <div className="ana-label" style={{ color: 'var(--lb-muted)' }}>Countries</div>
          </div>
        </div>
      </section>

      {/* FORUMS SECTION */}
      <section className="community-section" id="community" style={{ padding: '80px 52px' }}>
        <div className="sec-header reveal visible">
          <div>
            <div className="sec-eye">Discussions</div>
            <h2 className="sec-h2">Community<br />Forums</h2>
          </div>
          <button className="btn btn-ghost">Create Topic +</button>
        </div>

        <div className="community-grid">
          <div className="forum-list reveal visible">
            {[
              { icon: <HiLightningBolt />, title: "Career Pivots", sub: "How to move from engineering to design", count: "1.2K" },
              { icon: <HiAcademicCap />, title: "Study Abroad", sub: "Tips for GRE, TOEFL and scholarship essays", count: "3.4K" },
              { icon: <HiChatAlt2 />, title: "General Chit-Chat", sub: "Introduce yourself to the tribe", count: "5.1K" },
              { icon: <HiUsers />, title: "Local Founders", sub: "Networking for West African startups", count: "890" }
            ].map((forum, i) => (
              <div key={i} className="forum-card">
                <div className="forum-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: 'var(--lb-cream)', color: 'var(--lb-accent)' }}>
                  {forum.icon}
                </div>
                <div className="forum-info">
                  <div className="forum-name">{forum.title}</div>
                  <div className="forum-sub">{forum.sub}</div>
                </div>
                <div className="forum-count">
                  <div className="fc-num">{forum.count}</div>
                  <div className="fc-label">posts</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mentorship-card reveal visible" style={{ background: 'var(--lb-ink)', color: 'var(--lb-paper)' }}>
            <div className="mc-eye" style={{ color: 'var(--lb-accent)' }}>Featured Discussion</div>
            <div className="mc-title">Why "Soft Skills" are<br />the new Hard Skills</div>
            <div className="mc-sub" style={{ opacity: 0.7 }}>A deep dive into why emotional intelligence is outperforming technical expertise in the 2025 job market.</div>

            <div className="mentor-list">
              <div className="mentor-item" style={{ borderBottom: '1px solid rgba(246,243,238,0.1)' }}>
                <div className="m-avatar">👨🏽‍💼</div>
                <div className="m-info">
                  <div className="m-name" style={{ color: '#fff' }}>Ama Darko</div>
                  <div className="m-role" style={{ color: 'rgba(246,243,238,0.6)' }}>HR Director @ Zenith Bank</div>
                </div>
              </div>
            </div>
            <button className="btn btn-accent" style={{ marginTop: '24px', width: '100%' }} onClick={() => window.open("https://www.skillsyouneed.com/", "_blank")}>Read Discussion</button>
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="section" style={{ padding: '80px 52px', borderTop: '1px solid var(--lb-border)' }}>
        <div className="sec-header reveal visible">
          <div>
            <div className="sec-eye">Events</div>
            <h2 className="sec-h2">Upcoming<br />Huddles</h2>
          </div>
        </div>
        
        <div className="trending-grid">
          {[
            { date: "MAR 12", title: "Product Design Workshop", org: "Figma Africa", type: "Workshop" },
            { date: "MAR 18", title: "Scale-up Summit 2025", org: "Impact Hub Accra", type: "Networking" },
            { date: "APR 02", title: "CV Review Live", org: "LeapBod Team", type: "Webinar" }
          ].map((event, i) => (
            <div key={i} className="t-card reveal visible">
              <div className="t-rank" style={{ fontSize: '14px', letterSpacing: '2px' }}>{event.date}</div>
              <div className="t-ico">📅</div>
              <div className="t-type">{event.type}</div>
              <div className="t-title">{event.title}</div>
              <div className="t-org">{event.org}</div>
              <div className="t-foot" style={{ marginTop: '24px' }}>
                <button className="btn btn-dark" style={{ width: '100%' }}>Register Now</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <button 
            className="btn btn-paper btn-lg" 
            style={{ border: '1px solid var(--lb-border)' }}
            onClick={() => window.open("https://en.productguru.co/huddles", "_blank")}
          >
            See more events →
          </button>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-bg-text">TRIBE</div>
        <div className="cta-eye">Our Manifesto</div>
        <h2 className="cta-h2">Built by users,<br /><em>for users.</em></h2>
        <p className="cta-sub">We believe in radical transparency and mutual support. Every member is a contributor.</p>
        <div className="cta-btns">
          <button className="btn btn-paper btn-lg">Join the Tribe →</button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
