import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { HiCheckCircle, HiLightningBolt, HiUserGroup, HiTrendingUp } from "react-icons/hi";

export default function EmployersPage() {
  const navigate = useNavigate();
  return (
    <div className="landing-page" style={{ background: 'var(--lb-paper)', minHeight: '100vh' }}>
      <Navigation />
      
      <main style={{ paddingTop: '100px' }}>
        {/* Hero Section */}
        <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', padding: '8px 16px', borderRadius: '100px', 
            background: 'rgba(232, 93, 38, 0.1)', color: 'var(--lb-accent)', 
            fontSize: '14px', fontWeight: 600, marginBottom: '24px' 
          }}>
            For Organizations & Employers
          </div>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, 
            letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '24px',
            color: 'var(--lb-ink)'
          }}>
            Find the next generation of <span style={{ color: 'var(--lb-accent)' }}>global talent.</span>
          </h1>
          <p style={{ 
            fontSize: '1.2rem', color: 'var(--lb-muted)', maxWidth: '700px', 
            margin: '0 auto 40px', lineHeight: 1.6 
          }}>
            Connect with ambitious students and early-career professionals from around the world. 
            LeapBod simplifies how you reach, engage, and recruit top emerging talent.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/dashboard')} className="btn btn-dark" style={{ padding: '16px 32px', fontSize: '1rem' }}>Post an Opportunity</button>
            <button onClick={() => navigate('/contact')} className="btn btn-ghost" style={{ padding: '16px 32px', fontSize: '1rem' }}>Contact Sales</button>
          </div>
        </section>

        {/* Benefits Section */}
        <section style={{ padding: '80px 24px', background: 'var(--lb-ink)', color: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>Why partner with LeapBod?</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>We provide the tools you need to build your talent ecosystem.</p>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '32px' 
            }}>
              {[
                {
                  icon: <HiUserGroup />,
                  title: "Global Reach",
                  description: "Access a diverse pool of talent from over 150 countries, spanning across multiple disciplines and expertise levels."
                },
                {
                  icon: <HiLightningBolt />,
                  title: "Direct Engagement",
                  description: "Talk directly with applicants through our platform, reducing time-to-hire and improving the candidate experience."
                },
                {
                  icon: <HiCheckCircle />,
                  title: "Verified Profiles",
                  description: "Our community-driven verification system ensures you're looking at accurate, high-quality professional profiles."
                },
                {
                  icon: <HiTrendingUp />,
                  title: "Brand Awareness",
                  description: "Increase your company's visibility among the world's most proactive and ambitious emerging professionals."
                }
              ].map((benefit, i) => (
                <div key={i} style={{ 
                  padding: '32px', borderRadius: '24px', 
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'transform 0.3s ease'
                }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', 
                    background: 'var(--lb-accent)', color: 'white', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', marginBottom: '24px'
                  }}>
                    {benefit.icon}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>{benefit.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Action Section */}
        <section style={{ padding: '100px 24px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--lb-accent) 0%, #ff8a5c 100%)', 
            padding: '60px 40px', borderRadius: '40px', color: 'white',
            boxShadow: '0 20px 40px rgba(232, 93, 38, 0.2)'
          }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px' }}>Ready to Scale Your Team?</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '32px', opacity: 0.9 }}>
              Join hundreds of organizations already finding their best talent on LeapBod.
            </p>
            <button onClick={() => navigate('/community')} className="btn" style={{ 
              background: 'white', color: 'var(--lb-accent)', 
              padding: '16px 40px', fontSize: '1.1rem', fontWeight: 700,
              borderRadius: '16px', border: 'none', cursor: 'pointer'
            }}>
              Get Started for Free
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
