/**
 * Supabase Authentication Helpers
 * 
 * Authentication functions for user management with Supabase.
 * Falls back to anonymous/localStorage mode when not configured.
 */

import { getSupabaseClient, isSupabaseConfigured } from './client';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAnonymous: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Convert Supabase user to our User type
function toUser(supabaseUser: {
  id: string;
  email?: string;
  user_metadata?: { name?: string; avatar_url?: string };
  created_at?: string;
}): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name,
    avatarUrl: supabaseUser.user_metadata?.avatar_url,
    createdAt: new Date(supabaseUser.created_at || Date.now()),
  };
}

/**
 * Sign up a new user
 */
export async function signUp(data: SignUpData): Promise<{ user: User | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: new Error('Authentication not configured') };
  }

  try {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      return { user: null, error: new Error('Supabase client not available') };
    }

    const { data: authData, error } = await (supabase as {
      auth: {
        signUp: (params: {
          email: string;
          password: string;
          options?: { data?: { name?: string } };
        }) => Promise<{
          data: { user: { id: string; email?: string; user_metadata?: { name?: string }; created_at?: string } | null };
          error: Error | null;
        }>;
      };
    }).auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    });

    if (error) {
      return { user: null, error };
    }

    return {
      user: authData.user ? toUser(authData.user) : null,
      error: null,
    };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(data: SignInData): Promise<{ user: User | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: new Error('Authentication not configured') };
  }

  try {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      return { user: null, error: new Error('Supabase client not available') };
    }

    const { data: authData, error } = await (supabase as {
      auth: {
        signInWithPassword: (params: {
          email: string;
          password: string;
        }) => Promise<{
          data: { user: { id: string; email?: string; user_metadata?: { name?: string }; created_at?: string } | null };
          error: Error | null;
        }>;
      };
    }).auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { user: null, error };
    }

    return {
      user: authData.user ? toUser(authData.user) : null,
      error: null,
    };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  try {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      return { error: null };
    }

    const { error } = await (supabase as {
      auth: {
        signOut: () => Promise<{ error: Error | null }>;
      };
    }).auth.signOut();

    return { error };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      return null;
    }

    const { data: { user } } = await (supabase as {
      auth: {
        getUser: () => Promise<{
          data: { user: { id: string; email?: string; user_metadata?: { name?: string }; created_at?: string } | null };
        }>;
      };
    }).auth.getUser();

    return user ? toUser(user) : null;
  } catch {
    return null;
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Authentication not configured') };
  }

  try {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      return { error: new Error('Supabase client not available') };
    }

    const { error } = await (supabase as {
      auth: {
        resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
      };
    }).auth.resetPasswordForEmail(email);

    return { error };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Get initial auth state
 */
export function getInitialAuthState(): AuthState {
  return {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isAnonymous: !isSupabaseConfigured(),
  };
}
