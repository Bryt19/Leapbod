import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { HiChevronDown, HiLogout, HiCog, HiShieldCheck, HiMenu, HiX } from "react-icons/hi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";


export default function Navigation() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);

  const handleSignout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(false);
    setShowSignoutConfirm(true);
  };

  const confirmSignout = async () => {
    await signOut();
    setShowSignoutConfirm(false);
    navigate('/');
  };

  const isAuthPage = location.pathname.startsWith("/auth/");

  return (
    <nav>
      <Link to="/" className="logo">Leap<em>Bod</em></Link>
      
      {!isAuthPage && (
        <ul className={`nav-links ${mobileMenuOpen ? 'mobile-show' : ''}`}>
          <li><Link to="/" className={location.pathname === "/" ? "active" : ""} onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
          <li><Link to="/opportunities" className={location.pathname.startsWith("/opportunities") ? "active" : ""} onClick={() => setMobileMenuOpen(false)}>Discover</Link></li>
          <li><Link to="/community" className={location.pathname.startsWith("/community") ? "active" : ""} onClick={() => setMobileMenuOpen(false)}>Community</Link></li>
          {user && <li><Link to="/dashboard" className={location.pathname.startsWith("/dashboard") ? "active" : ""} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link></li>}
        </ul>
      )}

      <div className="nav-right">
        {user && !isAuthPage ? (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="btn btn-ghost"
              style={{ padding: '4px 12px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--lb-border)' }}
            >
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: 'var(--lb-accent)', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 700
              }}>
                {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <span className="hide-mobile" style={{ fontSize: '14px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
              </span>
              <HiChevronDown style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {showDropdown && (
              <div 
                style={{ 
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, 
                  width: '240px', background: 'var(--lb-card)', 
                  borderRadius: '16px', boxShadow: 'var(--lb-shadow-lg)', 
                  border: '1px solid var(--lb-border)', padding: '8px',
                  zIndex: 1000,
                  animation: 'fadeUp 0.2s ease'
                }}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--lb-border)', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{profile?.full_name || "User"}</div>
                  <div style={{ fontSize: '12px', color: 'var(--lb-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                </div>

                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', color: 'var(--lb-ink)', fontSize: '14px' }}>
                  <HiCog /> My Dashboard
                </Link>

                {isAdmin && (
                  <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', color: 'var(--lb-accent)', fontSize: '14px', fontWeight: 600 }}>
                    <HiShieldCheck /> Admin Panel
                  </Link>
                )}

                <button 
                  onClick={handleSignout}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#ff3366', fontSize: '14px', textAlign: 'left' }}
                >
                  <HiLogout /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          !isAuthPage && (
            <>
              <button onClick={() => navigate('/auth/login', { state: { from: location.pathname } })} className="btn btn-ghost hide-mobile">Log in</button>
              <button onClick={() => navigate('/auth/login', { state: { from: location.pathname } })} className="btn btn-dark">Get started →</button>
            </>
          )
        )}

        {!isAuthPage && (
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        )}
      </div>

      {/* Sign Out Confirmation Dialog */}
      <Dialog open={showSignoutConfirm} onOpenChange={setShowSignoutConfirm}>
        <DialogContent className="w-[92vw] max-w-md p-6" style={{ borderRadius: '24px', background: 'var(--lb-paper)', border: '1px solid var(--lb-border)' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800 }}>Confirm Sign Out</DialogTitle>
            <DialogDescription style={{ color: 'var(--lb-muted)', fontSize: '15px', marginTop: '8px' }}>
              Are you sure you want to sign out of your account? You'll need to log in again to access your dashboard and saved items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button 
              className="btn btn-ghost w-full sm:w-auto" 
              onClick={() => setShowSignoutConfirm(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-dark w-full sm:w-auto" 
              onClick={confirmSignout}
              style={{ 
                background: 'var(--lb-ink)', 
                color: 'var(--lb-paper)', 
                border: '1px solid var(--lb-ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 15px',
                borderRadius: '12px',
                fontWeight: 600,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#ff3366';
                e.currentTarget.style.borderColor = '#ff3366';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(255, 51, 102, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--lb-ink)';
                e.currentTarget.style.borderColor = 'var(--lb-ink)';
                e.currentTarget.style.color = 'var(--lb-paper)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <HiLogout style={{ fontSize: '18px' }} /> Confirm Sign Out
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
