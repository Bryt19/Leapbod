import { Link } from "react-router-dom";
import "../pages/Landing.css"; // Ensure styles are available

const Footer = () => {
  return (
    <footer className="landing-page-footer" style={{ background: 'var(--lb-ink)', color: 'var(--lb-paper)', padding: '80px 52px 40px', marginTop: 'auto' }}>
      <div className="foot-top" style={{ paddingTop: '80px' }}>
        <div className="foot-brand">
          <Link to="/" className="logo" style={{ color: 'var(--lb-paper)' }}>Leap<em>Bod</em></Link>
          <p className="foot-tagline" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>
            The opportunity platform for everyone — students, professionals, entrepreneurs, and organizations.
          </p>
        </div>
        <div className="foot-col">
          <h4 style={{ color: 'var(--lb-paper)' }}>Discover</h4>
          <ul>
            <li><Link to="/opportunities" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>Jobs</Link></li>
            <li><Link to="/opportunities" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>Internships</Link></li>
            <li><Link to="/opportunities" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>Grants</Link></li>
            <li><Link to="/opportunities" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>Events</Link></li>
            <li><Link to="/opportunities" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>Fellowships</Link></li>
          </ul>
        </div>
        <div className="foot-col">
          <h4 style={{ color: 'var(--lb-paper)' }}>Community</h4>
          <ul>
            <li><a href="/#community" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>Forums</a></li>
            <li><a href="/#community" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>Mentorship</a></li>
            <li><a href="/#referral" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>Platform</a></li>
            <li><Link to="/leaderboard" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>Leaderboard</Link></li>
          </ul>
        </div>
        <div className="foot-col">
          <h4 style={{ color: 'var(--lb-paper)' }}>Company</h4>
          <ul>
            <li><Link to="/about" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>About</Link></li>
            <li><a href="/#employers" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>For Employers</a></li>
            <li><Link to="/blog" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>Blog</Link></li>
            <li><Link to="/contact" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>Contact</Link></li>
          </ul>
        </div>
        <div className="foot-col">
          <h4 style={{ color: 'var(--lb-paper)' }}>Legal</h4>
          <ul>
            <li><Link to="/privacy" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>Privacy Policy</Link></li>
            <li><Link to="/terms" style={{ color: 'rgba(246, 243, 238, 0.6)' }}>Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="foot-bot">
        <div className="foot-copy" style={{ color: 'rgba(246, 243, 238, 0.4)' }}>
          © {new Date().getFullYear()} LeapBod. All rights reserved.
        </div>
        <div className="social-row">
          <a className="soc" href="#" style={{ color: 'var(--lb-ink)', background: 'var(--lb-paper)' }}>𝕏</a>
          <a className="soc" href="#" style={{ color: 'var(--lb-ink)', background: 'var(--lb-paper)' }}>in</a>
          <a className="soc" href="#" style={{ color: 'var(--lb-ink)', background: 'var(--lb-paper)' }}>ig</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
