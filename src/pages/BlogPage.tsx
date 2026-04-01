import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import "./Landing.css";

export default function BlogPage() {
  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--lb-paper)', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <div style={{ flex: 1, padding: '120px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%', color: 'var(--lb-ink)' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '24px', textAlign: 'center' }}>LeapBod Blog</h1>
        <p style={{ fontSize: '18px', lineHeight: 1.6, marginBottom: '60px', textAlign: 'center', opacity: 0.8 }}>
          Insights, tips, and stories from the LeapBod community.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          
          <div style={{ background: 'var(--lb-card)', borderRadius: '24px', padding: '24px', border: '1px solid var(--lb-border)' }}>
            <div style={{ height: '200px', background: 'rgba(0,0,0,0.05)', borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '48px' }}>📝</span>
            </div>
            <div style={{ opacity: 0.6, fontSize: '14px', marginBottom: '12px' }}>April 2, 2026</div>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', lineHeight: 1.3 }}>How to Ace Your Next Tech Interview</h2>
            <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '24px' }}>
              Discover the top strategies for preparing, practicing, and performing to land your dream tech role.
            </p>
            <button className="btn btn-ghost" style={{ padding: '0', height: 'auto' }}>Read more →</button>
          </div>

          <div style={{ background: 'var(--lb-card)', borderRadius: '24px', padding: '24px', border: '1px solid var(--lb-border)' }}>
            <div style={{ height: '200px', background: 'rgba(0,0,0,0.05)', borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '48px' }}>🌍</span>
            </div>
            <div style={{ opacity: 0.6, fontSize: '14px', marginBottom: '12px' }}>March 28, 2026</div>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', lineHeight: 1.3 }}>Finding Opportunities Abroad</h2>
            <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '24px' }}>
              From securing visas to finding relocation stipends, everything you need to know about working internationally.
            </p>
            <button className="btn btn-ghost" style={{ padding: '0', height: 'auto' }}>Read more →</button>
          </div>

          <div style={{ background: 'var(--lb-card)', borderRadius: '24px', padding: '24px', border: '1px solid var(--lb-border)' }}>
            <div style={{ height: '200px', background: 'rgba(0,0,0,0.05)', borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '48px' }}>💡</span>
            </div>
            <div style={{ opacity: 0.6, fontSize: '14px', marginBottom: '12px' }}>March 15, 2026</div>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', lineHeight: 1.3 }}>Building Your Network Effectively</h2>
            <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '24px' }}>
              Networking isn't just about collecting contacts. Learn how to build meaningful professional relationships.
            </p>
            <button className="btn btn-ghost" style={{ padding: '0', height: 'auto' }}>Read more →</button>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
