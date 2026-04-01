import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import "./Landing.css";

export default function AboutPage() {
  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--lb-paper)', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <div style={{ flex: 1, padding: '120px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', color: 'var(--lb-ink)' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '24px', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>Impact & Access</h1>
        <p style={{ fontSize: '18px', lineHeight: 1.6, marginBottom: '24px', opacity: 0.8 }}>
          LeapBod is the premier platform connecting ambitious individuals with life-changing opportunities.
          Whether you're a student looking for an internship, a professional seeking your next career move,
          or an organization looking to find top talent, we make discovery seamless and efficient.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '60px' }}>
          <div style={{ background: 'var(--lb-cream)', padding: '32px', borderRadius: '24px' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>👁️</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '12px' }}>Transparency</h3>
            <p style={{ opacity: 0.7, fontSize: '15px' }}>We believe every opportunity should be visible to everyone, regardless of where they are in the world.</p>
          </div>
          <div style={{ background: 'var(--lb-card)', padding: '32px', borderRadius: '24px', border: '1px solid var(--lb-border)' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🤝</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '12px' }}>Community</h3>
            <p style={{ opacity: 0.7, fontSize: '15px' }}>LeapBod is built by users, for users. We thrive on mutual support and shared knowledge.</p>
          </div>
          <div style={{ background: 'var(--lb-card)', padding: '32px', borderRadius: '24px', border: '1px solid var(--lb-border)' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>⚡</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '12px' }}>Speed</h3>
            <p style={{ opacity: 0.7, fontSize: '15px' }}>Time is our most valuable asset. We optimize for high-impact matching and zero friction.</p>
          </div>
          <div style={{ background: 'var(--lb-cream)', padding: '32px', borderRadius: '24px' }}>
<div style={{ fontSize: '24px', marginBottom: '16px' }}>🌍</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '12px' }}>Global Reach</h3>
            <p style={{ opacity: 0.7, fontSize: '15px' }}>From tech hubs to emerging markets, your potential shouldn't be limited by geography.</p>
          </div>
        </div>

        <div style={{ marginTop: '80px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: 800 }}>Our Story</h2>
          <p style={{ fontSize: '18px', lineHeight: 1.6, maxWidth: '600px', margin: '24px auto', opacity: 0.8 }}>
            Started in 2025 as a small project to help students find internships, LeapBod has quickly evolved into a comprehensive infrastructure for global opportunities. We’re just getting started.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
