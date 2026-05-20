import { createBrowserClient } from "@supabase/ssr";

let _supabaseBrowserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (_supabaseBrowserClient) return _supabaseBrowserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)");
  }

  _supabaseBrowserClient = createBrowserClient(url, anonKey);
  return _supabaseBrowserClient;
}
