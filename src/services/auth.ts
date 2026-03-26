import { supabase } from './supabase';
import type { User, UserProfile } from '../types';

export type AuthError = { message: string };

// ─── Sign in ────────────────────────────────────────────────────────
export async function signIn(
  email: string, password: string
): Promise<{ user: User; profile: UserProfile } | AuthError> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { message: error?.message ?? 'Ошибка входа' };
  return buildUserData(data.user.id, email, data.user.user_metadata);
}

// ─── Sign up ────────────────────────────────────────────────────────
export async function signUp(
  email: string, password: string, name: string, role: 'patient' | 'expert'
): Promise<{ user: User; profile: UserProfile } | AuthError> {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name, role } },
  });
  if (error || !data.user) return { message: error?.message ?? 'Ошибка регистрации' };

  // Upsert profile row (trigger may also create it)
  await supabase.from('user_profiles').upsert({
    user_id: data.user.id,
    name,
  }, { onConflict: 'user_id' });

  return buildUserData(data.user.id, email, { name, role });
}

// ─── Sign out ───────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// ─── OAuth (Google / Apple) ─────────────────────────────────────────
export async function signInWithProvider(
  provider: 'google' | 'apple'
): Promise<AuthError | null> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/` },
  });
  return error ? { message: error.message } : null;
}

// ─── Restore session ────────────────────────────────────────────────
export async function restoreSession(): Promise<{ user: User; profile: UserProfile } | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;
  const { id, email, user_metadata } = data.session.user;
  return buildUserData(id, email ?? '', user_metadata);
}

// ─── Helpers ────────────────────────────────────────────────────────
function isAuthError(v: unknown): v is AuthError {
  return typeof v === 'object' && v !== null && 'message' in v;
}

function buildUserData(
  id: string, email: string, meta: Record<string, unknown>
): { user: User; profile: UserProfile } {
  const user: User = {
    id,
    email,
    role:             (meta.role as User['role']) ?? 'patient',
    subscriptionTier: 'essential',
    createdAt:        new Date().toISOString(),
  };
  const profile: UserProfile = {
    userId:     id,
    name:       (meta.name as string) ?? email.split('@')[0],
    conditions: [],
    allergies:  [],
  };
  return { user, profile };
}

export { isAuthError };
