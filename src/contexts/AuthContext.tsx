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
        console.log("AuthContext: Getting initial session...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("AuthContext: Error getting session:", error);
          return;
        }

        console.log(
          "AuthContext: Got session:",
          session?.user?.id || "No session"
        );
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log(
            "AuthContext: Fetching profile for user:",
            session.user.id
          );
          try {
            await fetchUserProfile(session.user.id);
          } catch (error) {
            console.error(
              "AuthContext: Error fetching profile during initial load:",
              error
            );
          }
        } else {
          console.log("AuthContext: No user in session");
        }
      } catch (error) {
        console.error("AuthContext: Error in getInitialSession:", error);
      } finally {
        // no-op
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "AuthContext: Auth state changed:",
        event,
        session?.user?.id || "No user"
      );

      if (!mounted) {
        console.log(
          "AuthContext: Component unmounted, skipping auth state change"
        );
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN" && session?.user) {
        console.log(
          "AuthContext: User signed in, handling sign in for:",
          session.user.id
        );
        try {
          await handleUserSignIn(session.user);
          console.log("AuthContext: Sign in handling complete");
          // Only redirect away from auth pages; otherwise keep current route or restore lastPath
          const isAuthPage = location.pathname === "/auth/login" || location.pathname === "/auth/callback";
          if (isAuthPage) {
            const lastPath = localStorage.getItem("lastPath");
            navigate(lastPath || "/dashboard");
          }
        } catch (error) {
          console.error("AuthContext: Error handling user sign in:", error);
        } finally {
          setLoading(false);
        }
      } else if (event === "SIGNED_OUT") {
        console.log("AuthContext: User signed out");
        setProfile(null);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => {
      console.log("AuthContext: Cleaning up subscription");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("AuthContext: Fetching profile for user:", userId);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("AuthContext: Error fetching profile:", error);
        return;
      }

      console.log("AuthContext: Fetched profile:", profile);
      setProfile(profile);
    } catch (error) {
      console.error("AuthContext: Error fetching profile:", error);
    }
  };

  const handleUserSignIn = async (user: User) => {
    try {
      console.log("AuthContext: Handling user sign in for:", user.id);

      // Check if profile exists
      console.log("AuthContext: Checking for existing profile...");
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error(
          "AuthContext: Error checking existing profile:",
          fetchError
        );
        return;
      }

      if (existingProfile) {
        console.log("AuthContext: Found existing profile:", existingProfile);
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
            console.error("AuthContext: Error updating profile role:", updateError);
            setProfile(existingProfile);
            return;
          }
          setProfile(updated);
          return;
        }
        setProfile(existingProfile);
        return;
      }

      console.log(
        "AuthContext: No existing profile found, creating new one..."
      );

      // Only leapboard5@gmail.com should be admin (case-insensitive), all others are students
      const normalizedEmail = (user.email || "").toLowerCase();
      const desiredRole = normalizedEmail === "leapboard5@gmail.com" ? "admin" : "student";

      console.log(
        "AuthContext: Creating new profile with role:",
        desiredRole,
        "for email:",
        user.email
      );

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
        console.error("AuthContext: Error creating profile:", insertError);
        return;
      }

      console.log("AuthContext: Created new profile:", newProfile);
      setProfile(newProfile);
    } catch (error) {
      console.error("AuthContext: Error handling user sign in:", error);
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
        console.error("Error signing in with Google:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
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
      console.error("Error signing out:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin =
    (user?.email || "").toLowerCase() === "leapboard5@gmail.com" ||
    profile?.role === "admin";

  // Do not globally block rendering; pages handle their own loading

  console.log(
    "AuthContext: Rendering app with user:",
    user?.id,
    "profile:",
    profile?.id,
    "loading:",
    loading
  );

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
