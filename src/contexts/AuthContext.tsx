import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { isTestUser } from '@/lib/test-data';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The test-user auth bypass fabricates a session with no password check —
// it must never be reachable outside local/dev builds.
const TEST_USER_BYPASS_ENABLED = import.meta.env.DEV;

// Mock user/session for test accounts
function createMockSession(email: string): { user: User; session: Session } {
  const mockUser: User = {
    id: 'test-user-id',
    email,
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
  } as User;

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  return { user: mockUser, session: mockSession };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for mock session first (test users) — dev/local builds only
    if (TEST_USER_BYPASS_ENABLED) {
      const mockSessionData = localStorage.getItem('mock-session');
      if (mockSessionData) {
        try {
          const { user: mockUser, session: mockSession } = JSON.parse(mockSessionData);
          setUser(mockUser);
          setSession(mockSession);
          setLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem('mock-session');
        }
      }
    } else {
      localStorage.removeItem('mock-session');
    }

    // Get initial session from Supabase (real users)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    // Handle test user sign-up (dev/local builds only)
    if (TEST_USER_BYPASS_ENABLED && isTestUser(email)) {
      const { user: mockUser, session: mockSession } = createMockSession(email);
      setUser(mockUser);
      setSession(mockSession);
      localStorage.setItem('mock-session', JSON.stringify({ user: mockUser, session: mockSession }));
      return;
    }

    // Real user sign-up
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    // Handle test user sign-in (dev/local builds only)
    if (TEST_USER_BYPASS_ENABLED && isTestUser(email)) {
      const { user: mockUser, session: mockSession } = createMockSession(email);
      setUser(mockUser);
      setSession(mockSession);
      localStorage.setItem('mock-session', JSON.stringify({ user: mockUser, session: mockSession }));
      return;
    }

    // Real user sign-in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    // Clear mock session if exists
    const mockSessionData = localStorage.getItem('mock-session');
    if (mockSessionData) {
      localStorage.removeItem('mock-session');
      setUser(null);
      setSession(null);
      return;
    }

    // Real user sign-out
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
