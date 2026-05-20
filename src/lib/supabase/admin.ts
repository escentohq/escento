import { createClient } from "@supabase/supabase-js";

import { ADMIN_CREDENTIALS_ERROR } from "@/lib/account-deletion";

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(ADMIN_CREDENTIALS_ERROR);
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
