"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  role?: string;
}

interface AuthContextType {
  session: Session | null;
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (currentSession: Session) => {
    try {
      const response = await fetch("/api/auth/current-user", {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const dbUser = data.user;

        console.group("👤 AuthContext: Profile Fetched");
        console.log("API Response User:", dbUser);
        console.log("Sync Role:", dbUser.role);
        console.log("Needs Role Selection:", dbUser.needsRoleSelection);
        console.groupEnd();

        // Update user state with DB data
        setUser({
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          image:
            currentSession.user.user_metadata?.avatar ||
            currentSession.user.user_metadata?.image ||
            currentSession.user.user_metadata?.picture,
          role: dbUser.role,
        });

        // Check for role selection requirement
        if (!dbUser.role || dbUser.needsRoleSelection) {
          console.log("🚨 AuthContext: Role selection needed! Redirecting...");
          // Avoid redirect loop if already on role selection page
          if (window.location.pathname !== "/auth/role-selection") {
            router.push("/auth/role-selection");
          }
        }
      } else {
        // Fallback to session data if API fails
        console.error("Failed to fetch user profile", response.status);
        setUser(mapSupabaseUser(currentSession.user));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(mapSupabaseUser(currentSession.user));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.push("/");
    router.refresh();
  };

  const value = {
    session,
    user,
    loading,
    isAuthenticated: !!session,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function mapSupabaseUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email?.split("@")[0],
    image:
      user.user_metadata?.avatar ||
      user.user_metadata?.image ||
      user.user_metadata?.picture,
    role: user.user_metadata?.role,
  };
}
