import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import "./Landing.css";

export default function PrivacyPage() {
  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--lb-paper)', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <div style={{ flex: 1, padding: '120px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', color: 'var(--lb-ink)' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '40px' }}>Privacy Policy</h1>
        
        <div style={{ fontSize: '18px', lineHeight: 1.6 }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>1. Information We Collect</h2>
          <p style={{ marginBottom: '24px' }}>
            When you register, we collect personal information such as your name, email address, and 
            other profile details to enhance your experience. We also collect usage data to improve our services.
          </p>

          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>2. How We Use Your Data</h2>
          <p style={{ marginBottom: '24px' }}>
            We use your data to provide a personalized experience, manage your account, recommend 
            opportunities based on your interests, and communicate updates or promotional offers.
          </p>

          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>3. Data Sharing</h2>
          <p style={{ marginBottom: '24px' }}>
            Your information will not be sold to third-party services. We only share necessary data 
            with our verified integrations to ensure smooth functionality, subject to strict privacy terms.
          </p>

          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>4. Security</h2>
          <p style={{ marginBottom: '24px' }}>
            We implement strong security measures to protect internal systems. Even so, we remind users to 
            create secure passwords and practice standard digital safety rules.
          </p>
          
          <p style={{ fontStyle: 'italic', marginTop: '40px' }}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
