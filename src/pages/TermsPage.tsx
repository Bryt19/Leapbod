import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import "./Landing.css";

export default function TermsPage() {
  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--lb-paper)', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <div style={{ flex: 1, padding: '120px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', color: 'var(--lb-ink)' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '40px' }}>Terms of Service</h1>
        
        <div style={{ fontSize: '18px', lineHeight: 1.6 }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
          <p style={{ marginBottom: '24px' }}>
            By accessing and using LeapBod, you agree to comply with and be bound by these terms. 
            If you do not agree to these terms, please do not use our services.
          </p>

          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>2. User Responsibilities</h2>
          <p style={{ marginBottom: '24px' }}>
            You are responsible for maintaining the security of your account, providing accurate information 
            during registration, and complying with all applicable laws and regulations.
          </p>

          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>3. Opportunities and Postings</h2>
          <p style={{ marginBottom: '24px' }}>
            We do not endorse or guarantee the validity of any third-party opportunities posted on our platform. 
            Users should exercise their own judgment and due diligence before applying.
          </p>

          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>4. Platform Usage</h2>
          <p style={{ marginBottom: '24px' }}>
            Any malicious activity, including scraping, reverse engineering, or intentional disruption of the 
            services provided, is strictly prohibited and will result in account termination.
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
