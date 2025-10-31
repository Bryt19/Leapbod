import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/database.types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
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
        if (!mounted || !result) return;

        const {
          data: { session },
          error,
        } = result as Awaited<typeof sessionPromise>;

        if (error) {
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && mounted) {
          // Fetch profile in background, don't wait for it
          fetchUserProfile(session.user.id).catch(() => {
            // Silently handle profile fetch errors
          });
        }
      } catch (error) {
        // Silently handle session errors
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
          if (isAuthPage) {
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
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        return;
      }

      setProfile(profile);
    } catch (error) {
      // Silently handle profile fetch errors
    }
  };

  const handleUserSignIn = async (user: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (fetchError) {
        return;
      }

      if (existingProfile) {
        // Ensure admin stays in sync with email rule
        const normalizedEmail = (user.email || "").toLowerCase();
        const shouldBeAdmin = normalizedEmail === "leapboard5@gmail.com";
        if ((shouldBeAdmin && existingProfile.role !== "admin") || (!shouldBeAdmin && existingProfile.role !== "student")) {
          const { data: updated, error: updateError } = await supabase
            .from("profiles")
            .update({ role: shouldBeAdmin ? "admin" : "student", email: user.email || existingProfile.email })
            .eq("id", user.id)
            .select()
            .single();
          if (updateError) {
            setProfile(existingProfile);
            return;
          }
          setProfile(updated);
          return;
        }
        setProfile(existingProfile);
        return;
      }

      // Only leapboard5@gmail.com should be admin (case-insensitive), all others are students
      const normalizedEmail = (user.email || "").toLowerCase();
      const desiredRole = normalizedEmail === "leapboard5@gmail.com" ? "admin" : "student";

      // Create profile for new user - only using fields that exist in the schema
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          role: desiredRole,
          email: user.email || null,
        })
        .select()
        .single();

      if (insertError) {
        return;
      }

      setProfile(newProfile);
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

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Silently handle sign out errors
      }

      // Clear local state
      setUser(null);
      setProfile(null);
      setSession(null);

      // Preserve theme; remove app-specific keys
      const theme = localStorage.getItem("theme");
      localStorage.clear();
      if (theme) localStorage.setItem("theme", theme);

      // Redirect to homepage and replace history entry
      navigate("/", { replace: true });
      // Hard redirect fallback to guarantee navigation
      setTimeout(() => {
        if (window.location.pathname !== "/") {
          window.location.assign("/");
        }
      }, 50);
    } catch (error) {
      throw error;
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
    signOut,
    isAdmin,
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
