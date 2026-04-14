
import { AuthUI } from "../components/ui/auth-fuse";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function ForgotPasswordPage() {
  return (
    <div className="landing-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--lb-paper)' }}>
      <Navigation />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '60px' }}>
        <AuthUI initialMode="forgot" />
      </div>
      <div className="hidden">
        <Footer />
      </div>
    </div>
  );
}
