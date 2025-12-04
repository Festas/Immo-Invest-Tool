/**
 * Supabase Client Configuration
 *
 * Initialize and configure the Supabase client for authentication and database access.
 * The Supabase library is optional - all features work offline when not installed.
 */

// This file sets up the Supabase client for use in the application.
// Environment variables are required for production use.

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Supabase client interface for type safety.
 * This matches the essential methods used by the auth module.
 */
export interface SupabaseClientInterface {
  auth: {
    signUp: (params: {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown> };
    }) => Promise<{ data: { user: SupabaseUser | null }; error: Error | null }>;
    signInWithPassword: (params: {
      email: string;
      password: string;
    }) => Promise<{ data: { user: SupabaseUser | null }; error: Error | null }>;
    signOut: () => Promise<{ error: Error | null }>;
    getUser: () => Promise<{ data: { user: SupabaseUser | null } }>;
    resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  };
}

export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: { name?: string; avatar_url?: string };
  created_at?: string;
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// Get Supabase configuration
export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

// Type-safe Supabase client holder
const supabaseClient: SupabaseClientInterface | null = null;

/**
 * Get Supabase client - returns null if not configured or library not installed.
 * To enable cloud sync, install @supabase/supabase-js and configure environment variables.
 */
export async function getSupabaseClient(): Promise<SupabaseClientInterface | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (supabaseClient) {
    return supabaseClient;
  }

  // Supabase is optional - this stub returns null when not installed
  // To enable: npm install @supabase/supabase-js
  // Then uncomment the dynamic import below
  console.warn(
    "Supabase client not available. Install @supabase/supabase-js to enable cloud sync."
  );
  return null;

  // Uncomment when @supabase/supabase-js is installed:
  /*
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const config = getSupabaseConfig();
    
    if (config) {
      supabaseClient = createClient(config.url, config.anonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }) as SupabaseClientInterface;
    }
    
    return supabaseClient;
  } catch {
    console.warn('Supabase client not available. Install @supabase/supabase-js to enable cloud sync.');
    return null;
  }
  */
}

// Database types for properties
export interface DatabaseProperty {
  id: string;
  user_id: string;
  name: string;
  address?: string;
  postal_code?: string;
  input_data: Record<string, unknown>;
  output_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DatabaseScenario {
  id: string;
  property_id: string;
  name: string;
  input_data: Record<string, unknown>;
  output_data?: Record<string, unknown>;
  created_at: string;
}

export interface DatabaseChecklist {
  id: string;
  user_id: string;
  property_id?: string;
  items: Array<{
    id: string;
    completed: boolean;
    notes?: string;
  }>;
  updated_at: string;
}
