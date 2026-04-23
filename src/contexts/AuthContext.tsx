import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/database.types";
import { getCache, setCache, dedupeRequest } from "../lib/utils";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  verifyEmailOtp: (email: string, token: string, type: 'signup' | 'recovery') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: (e?: React.MouseEvent) => Promise<void>;
  isAdmin: boolean;
  isProfileLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  // Removed global initial load gating to avoid blocking UI

  useEffect(() => {
    let mounted = true;
    // Do not block UI globally; we only track session in background

    // Get initial session
    const getInitialSession = async () => {
      if (!mounted) return;

      try {
        // Add timeout to prevent hanging on slow network (3 second timeout)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), 3000);
        });

        const result = await Promise.race([sessionPromise, timeoutPromise]);
        if (!mounted) return;
        
        if (!result) {
          setIsProfileLoading(false);
          return;
        }

        const {
          data: { session },
          error,
        } = result as Awaited<typeof sessionPromise>;

        if (error) {
          setIsProfileLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && mounted) {
          // Fetch profile in background, don't wait for it
          fetchUserProfile(session.user.id).finally(() => {
            if (mounted) setIsProfileLoading(false);
          });
        } else {
          setIsProfileLoading(false);
        }
      } catch (error) {
        setIsProfileLoading(false);
      } finally {
        // no-op
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } =     supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) {
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      // Handle different auth events
      if (event === "SIGNED_IN" && session?.user) {
        try {
          await handleUserSignIn(session.user);
          // Only redirect away from auth pages; otherwise keep current route or restore lastPath
          const isAuthPage = location.pathname === "/auth/login" || location.pathname === "/auth/callback";
          if (isAuthPage && !(window as any).skipAuthRedirect) {
            const lastPath = localStorage.getItem("lastPath");
            navigate(lastPath || "/dashboard");
          }
        } catch (error) {
          // Silently handle sign in errors
        } finally {
          setLoading(false);
        }
      } else if (event === "SIGNED_OUT") {
        // Only clear if we're actually signed out (session is null)
        if (!session) {
          setProfile(null);
        }
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED") {
        // Token refreshed - just update session, don't block UI or clear data
        // Profile fetch happens in background if needed
        if (session?.user && mounted) {
          fetchUserProfile(session.user.id).catch(() => {
            // Silently handle profile fetch errors
          });
        }
        setLoading(false);
      } else if (event === "USER_UPDATED") {
        // User updated - refresh profile but keep data
        if (session?.user && mounted) {
          fetchUserProfile(session.user.id).catch(() => {
            // Silently handle profile fetch errors
          });
        }
        setLoading(false);
      } else if (event === "PASSWORD_RECOVERY") {
        // Handle recovery link click - the user will be redirected back to the app with a recovery session
        const isAuthPage = window.location.pathname === "/auth/login" || window.location.pathname === "/auth/callback";
        if (isAuthPage) {
          window.location.hash = "recovery";
        } else {
          navigate("/auth/login#recovery", { replace: true });
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
      
      // If we have a user but no profile yet, make sure we trigger a fetch
      if (session?.user && !profile) {
        fetchUserProfile(session.user.id).finally(() => {
          if (mounted) setIsProfileLoading(false);
        });
      } else if (!session?.user) {
        setIsProfileLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Check cache first
      const cacheKey = `profile:${userId}:v1`;
      const cached = getCache<Profile>(cacheKey);
      if (cached) {
        setProfile(cached as Profile);
        setIsProfileLoading(false);
      }

      const data = await dedupeRequest(`fetch-profile-${userId}`, async () => {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id,role,email,full_name,created_at")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          return null;
        }
        return profile as Profile | null;
      });

      if (data) {
        setProfile(data as Profile);
        setCache(cacheKey, data, 300_000); // 5 minute cache
      }
    } catch (error) {
      // Silently handle profile fetch errors
    }
  };

  const handleUserSignIn = async (user: User) => {
    try {
      // Check cache first
      const cacheKey = `profile:${user.id}:v1`;
      const cached = getCache<Profile>(cacheKey);
      if (cached) {
        // Ensure admin stays in sync with email rule
        const normalizedEmail = (user.email || "").toLowerCase();
        const shouldBeAdmin = normalizedEmail === "leapboard5@gmail.com";
        if ((shouldBeAdmin && cached.role !== "admin") || (!shouldBeAdmin && cached.role !== "student")) {
          // Need to update, fall through to fetch and update
        } else {
          setProfile(cached);
          return;
        }
      }

      // Check if profile exists
      const data = await dedupeRequest(`fetch-profile-${user.id}`, async () => {
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("id,role,email,full_name,created_at")
          .eq("id", user.id)
          .maybeSingle();
        
        if (fetchError) {
          return null;
        }
        return existingProfile as Profile | null;
      });
      
      const existingProfile = data;

      if (!existingProfile) {
        // Create new profile below
      } else {
        // Ensure leapboard5@gmail.com is always admin, but respect manually set admin roles for others
        const normalizedEmail = (user.email || "").toLowerCase();
        const shouldBeAdmin = normalizedEmail === "leapboard5@gmail.com";
        
        // Only auto-update role if:
        // 1. It's leapboard5@gmail.com and they're not admin (force admin)
        // 2. It's NOT leapboard5@gmail.com and they're admin but shouldn't be (only if they don't have a manually set admin role)
        // However, we want to respect manually set admin roles, so only force admin for leapboard5@gmail.com
        if (shouldBeAdmin && existingProfile.role !== "admin") {
          // Force admin status for leapboard5@gmail.com
          // Extract full_name from user metadata if not already set in profile
          const fullName = 
            existingProfile.full_name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            (user.user_metadata?.given_name && user.user_metadata?.family_name
              ? `${user.user_metadata.given_name} ${user.user_metadata.family_name}`
              : null) ||
            null;

          const { data: updated, error: updateError } = await supabase
            .from("profiles")
            .update({ 
              role: "admin", 
              email: user.email || existingProfile.email,
              full_name: fullName,
            })
            .eq("id", user.id)
            .select("id,role,email,full_name,created_at")
            .single();
          if (updateError) {
            setProfile(existingProfile as Profile);
            setCache(cacheKey, existingProfile, 300_000);
            return;
          }
          setProfile(updated as Profile);
          setCache(cacheKey, updated, 300_000);
          return;
        }
        // For all other cases, respect the existing role (manually set admin roles are preserved)
        setProfile(existingProfile as Profile);
        setCache(cacheKey, existingProfile, 300_000);
        return;
      }

      // Only leapboard5@gmail.com should be admin (case-insensitive), all others are students
      const normalizedEmail = (user.email || "").toLowerCase();
      const desiredRole = normalizedEmail === "leapboard5@gmail.com" ? "admin" : "student";

      // Extract full_name from user metadata (Google OAuth provides full_name or name)
      const fullName = 
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        (user.user_metadata?.given_name && user.user_metadata?.family_name
          ? `${user.user_metadata.given_name} ${user.user_metadata.family_name}`
          : null) ||
        null;

      // Create profile for new user - only using fields that exist in the schema
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          role: desiredRole,
          email: user.email || null,
          full_name: fullName,
        })
        .select("id,role,email,full_name,created_at")
        .single();

      if (insertError) {
        return;
      }

      setProfile(newProfile as Profile);
      setCache(cacheKey, newProfile, 300_000);
    } catch (error) {
      // Silently handle sign in errors
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Do not globally block UI during OAuth redirect
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async (email: string, token: string, type: 'signup' | 'recovery') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({ email, token, type });
      if (error) throw error;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      console.log(`[Auth] Initiating password reset for: ${email}`);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/login`,
      });
      if (error) {
        console.error("[Auth] Supabase Password Reset Error:", error);
        throw error;
      }
      console.log("[Auth] Password reset request successful");
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      setLoading(true);
      // Force clear all local storage first to break any stuck loops
      const theme = localStorage.getItem("theme");
      localStorage.clear();
      if (theme) localStorage.setItem("theme", theme);
      
      // Clear all state immediately for instant UI response
      setUser(null);
      setProfile(null);
      setSession(null);

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signOut error:", error);
      }

      // Redirect and replace history entry
      navigate("/", { replace: true });
      
      // Hard reload fallback after a short delay if navigation seems stuck
      setTimeout(() => {
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }, 100);
    } catch (error) {
      console.error("Critical signOut error:", error);
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  const isAdmin =
    (user?.email || "").toLowerCase() === "leapboard5@gmail.com" ||
    profile?.role === "admin";

  // Do not globally block rendering; pages handle their own loading

  const value = {
    user,
    profile,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    verifyEmailOtp,
    resetPassword,
    updatePassword,
    signOut,
    isAdmin,
    isProfileLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
