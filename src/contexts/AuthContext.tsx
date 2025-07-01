import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database.types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      if (!mounted) return

      try {
        console.log('AuthContext: Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('AuthContext: Error getting session:', error)
          return
        }

        console.log('AuthContext: Got session:', session?.user?.id || 'No session')
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('AuthContext: Fetching profile for user:', session.user.id)
          try {
            await fetchUserProfile(session.user.id)
          } catch (error) {
            console.error('AuthContext: Error fetching profile during initial load:', error)
          }
        } else {
          console.log('AuthContext: No user in session')
        }
      } catch (error) {
        console.error('AuthContext: Error in getInitialSession:', error)
      } finally {
        if (mounted) {
          console.log('AuthContext: Setting initial load complete')
          setInitialLoadComplete(true)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, session?.user?.id || 'No user')
      
      if (!mounted) {
        console.log('AuthContext: Component unmounted, skipping auth state change')
        return
      }

      setSession(session)
      setUser(session?.user ?? null)
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('AuthContext: User signed in, handling sign in for:', session.user.id)
        try {
          await handleUserSignIn(session.user)
          console.log('AuthContext: Sign in handling complete')
          // Redirect to dashboard after successful sign in
          navigate('/dashboard')
        } catch (error) {
          console.error('AuthContext: Error handling user sign in:', error)
        } finally {
          setInitialLoadComplete(true)
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthContext: User signed out')
        setProfile(null)
        setInitialLoadComplete(true)
      } else {
        setInitialLoadComplete(true)
      }
    })

    return () => {
      console.log('AuthContext: Cleaning up subscription')
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('AuthContext: Fetching profile for user:', userId)
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('AuthContext: Error fetching profile:', error)
        return
      }

      console.log('AuthContext: Fetched profile:', profile)
      setProfile(profile)
    } catch (error) {
      console.error('AuthContext: Error fetching profile:', error)
    }
  }

  const handleUserSignIn = async (user: User) => {
    try {
      console.log('AuthContext: Handling user sign in for:', user.id)
      
      // Check if profile exists
      console.log('AuthContext: Checking for existing profile...')
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (fetchError) {
        console.error('AuthContext: Error checking existing profile:', fetchError)
        return
      }

      if (existingProfile) {
        console.log('AuthContext: Found existing profile:', existingProfile)
        setProfile(existingProfile)
        return
      }

      console.log('AuthContext: No existing profile found, creating new one...')
      
      // Only leapboard5@gmail.com should be admin, all others are students
      const role = user.email === 'leapboard5@gmail.com' ? 'admin' : 'student'
      
      console.log('AuthContext: Creating new profile with role:', role, 'for email:', user.email)

      // Create profile for new user - only using fields that exist in the schema
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role: role
        })
        .select()
        .single()

      if (insertError) {
        console.error('AuthContext: Error creating profile:', insertError)
        return
      }

      console.log('AuthContext: Created new profile:', newProfile)
      setProfile(newProfile)
    } catch (error) {
      console.error('AuthContext: Error handling user sign in:', error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('Error signing in with Google:', error)
        throw error
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        throw error
      }
      
      // Clear local state
      setUser(null)
      setProfile(null)
      setSession(null)

      // Clear localStorage
      localStorage.clear()

      // Redirect to homepage
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = profile?.role === 'admin'

  // Only show loading screen during initial app load, not during auth state changes
  if (!initialLoadComplete && loading) {
    console.log('AuthContext: Initial app load in progress, showing loading screen')
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    )
  }

  console.log('AuthContext: Rendering app with user:', user?.id, 'profile:', profile?.id, 'loading:', loading)

  const value = {
    user,
    profile,
    session,
    loading,
    signInWithGoogle,
    signOut,
    isAdmin
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 