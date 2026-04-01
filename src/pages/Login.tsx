import { AuthUI } from "../components/ui/auth-fuse";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function Login() {
  return (
    <div className="landing-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)' }}>
      <Navigation />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AuthUI />
      </div>
      <div className="hidden">
        {/* Hide footer on this specific Auth layout because it's a split screen. */}
        <Footer />
      </div>
    </div>
  );
}
