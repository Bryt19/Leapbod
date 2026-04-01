import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error during auth callback:', error)
          navigate('/auth/error')
          return
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          navigate('/dashboard')
        } else {
          // No session found, redirect to login
          navigate('/auth/login')
        }
      } catch (error) {
        console.error('Error during auth callback:', error)
        navigate('/auth/error')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--lb-paper)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '48px', height: '48px', borderRadius: '50%', 
          border: '4px solid var(--lb-border)', borderTopColor: 'var(--lb-blue)', 
          animation: 'spin 1s linear infinite', margin: '0 auto 24px' 
        }}></div>
        <h2 className="hero-h1" style={{ fontSize: '32px', marginBottom: '16px' }}>
          Completing sign in...
        </h2>
        <p className="hero-sub" style={{ fontSize: '18px', opacity: 0.8 }}>
          Please wait while we complete your authentication.
        </p>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
} 