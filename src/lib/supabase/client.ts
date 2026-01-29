import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Demo mode: return mock client if credentials not configured
  if (!url || !key) {
    return {
      auth: {
        signUp: async () => ({ data: { user: { id: 'demo-user' } }, error: null }),
        signInWithPassword: async () => ({ data: { user: { id: 'demo-user' } }, error: null }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
    } as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(url, key);
}
