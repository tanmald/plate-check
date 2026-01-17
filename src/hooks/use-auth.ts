import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

/**
 * Re-export useAuth from context for convenience
 */
export { useAuthContext as useAuth };

/**
 * Hook to get the current user's profile
 */
export function useUserProfile() {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  return { profile, loading, error };
}

/**
 * Hook to create or update user profile
 */
export function useUpdateProfile() {
  const { user } = useAuthContext();

  const updateProfile = async (updates: { email?: string; full_name?: string }) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: updates.email || user.email || '',
        full_name: updates.full_name,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  };

  return { updateProfile };
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { user, loading } = useAuthContext();
  return { isAuthenticated: !!user, loading };
}
