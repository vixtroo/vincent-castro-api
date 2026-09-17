import { publicSupabase, supabase } from '../config/supabase.js';
import { AppError } from '../middleware/error.middleware.js';
import type { AuthUser, LoginInput } from '../types/auth.types.js';

interface LoginResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

export const login = async ({ email, password }: LoginInput): Promise<LoginResult> => {
  const { data, error } = await publicSupabase.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    throw new AppError(401, 'Invalid email or password');
  }

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
    user: { id: data.user.id, email: data.user.email ?? '' },
  };
};

export const logout = async (accessToken: string): Promise<void> => {
  const { error } = await supabase.auth.admin.signOut(accessToken, 'local');

  if (error) {
    console.error('Supabase logout failed', error);
    throw new AppError(502, 'Unable to log out');
  }
};