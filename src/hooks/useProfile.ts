import { useCallback, useEffect, useState } from 'react';
import type { UserProfile } from '../types';
import { isMissingColumnError, supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface ProfileRow {
  id: string;
  name: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({ name: '', email: '' });
  const [loading, setLoading] = useState(true);

  const email = user?.email ?? '';

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profile')
      .select('id, name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && isMissingColumnError(error, 'user_id')) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profile')
        .select('id, name')
        .maybeSingle();
      if (fallbackError) {
        setProfile({ name: '', email });
      } else if (fallbackData) {
        setProfile({ name: (fallbackData as ProfileRow).name ?? '', email });
      } else {
        await supabase
  .from('profile')
  .upsert(
    { user_id: user.id, name: '', email },
    { onConflict: 'user_id', ignoreDuplicates: true }
  );
const { data: inserted } = await supabase
  .from('profile')
  .select('id, name')
  .eq('user_id', user.id)
  .single();
setProfile({ name: (inserted as ProfileRow | null)?.name ?? '', email });
      }
    } else if (data) {
      setProfile({ name: (data as ProfileRow).name ?? '', email });
    } else {
      // No profile row yet — create one with the auth email
      await supabase
  .from('profile')
  .upsert(
    { user_id: user.id, name: '', email },
    { onConflict: 'user_id', ignoreDuplicates: true }
  );
const { data: inserted } = await supabase
  .from('profile')
  .select('id, name')
  .eq('user_id', user.id)
  .single();
setProfile({ name: (inserted as ProfileRow | null)?.name ?? '', email });
    }
    setLoading(false);
  }, [user, email]);

  useEffect(() => {
    if (!user) {
      setProfile({ name: '', email: '' });
      setLoading(true);
      return;
    }
    fetchProfile();
  }, [user, fetchProfile]);

  const updateProfile = useCallback(
    async (patch: Partial<UserProfile>): Promise<boolean> => {
      if (!user) return false;
      const dbPatch: Record<string, unknown> = {};
      if (patch.name !== undefined) dbPatch.name = patch.name;
      // email comes from auth, not editable here
      const { error } = await supabase
        .from('profile')
        .update(dbPatch)
        .eq('user_id', user.id);
      if (error) return false;
      setProfile((prev) => ({ ...prev, ...patch, email }));
      return true;
    },
    [user, email],
  );

  return { profile, loading, updateProfile };
}
