import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import "./Landing.css";

export default function LeaderboardPage() {
  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--lb-paper)', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <div style={{ flex: 1, padding: '120px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', color: 'var(--lb-ink)' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '24px', textAlign: 'center' }}>Leaderboard</h1>
        <p style={{ fontSize: '18px', lineHeight: 1.6, marginBottom: '60px', textAlign: 'center', opacity: 0.8 }}>
          Recognizing the most active members of our community.
        </p>

        <div style={{ background: 'var(--lb-card)', borderRadius: '24px', padding: '32px', border: '1px solid var(--lb-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', flexDirection: 'column', gap: '24px' }}>
            <div style={{ fontSize: '64px' }}>🏆</div>
            <h2 style={{ fontSize: '24px', margin: 0 }}>Coming Soon</h2>
            <p style={{ opacity: 0.7, textAlign: 'center' }}>
              We're hard at work building a gamified leaderboard experience. 
              Keep engaging, participating, and discovering opportunities to earn points early on!
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
