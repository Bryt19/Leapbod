import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import "./Landing.css";

export default function ContactPage() {
  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--lb-paper)', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <div style={{ flex: 1, padding: '120px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', color: 'var(--lb-ink)' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '24px' }}>Contact Us</h1>
        <p style={{ fontSize: '18px', lineHeight: 1.6, marginBottom: '24px' }}>
          Have a question or feedback? We'd love to hear from you.
        </p>
        <div style={{ background: 'var(--lb-card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--lb-border)' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Email</h2>
          <p style={{ fontSize: '18px' }}><a href="mailto:leapboard5@gmail.com" style={{ color: 'var(--lb-accent)' }}>leapboard5@gmail.com</a></p>
          
          <h2 style={{ fontSize: '24px', margin: '32px 0 16px' }}>Support</h2>
          <p style={{ fontSize: '18px', lineHeight: 1.6 }}>
            For general support and account inquiries, please send us an email and our team will normally respond within 24 to 48 hours.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
