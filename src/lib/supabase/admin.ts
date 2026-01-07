import { createClient } from '@supabase/supabase-js'

// Cliente Supabase com Service Role (apenas para operações administrativas no backend)
// NUNCA expor no frontend
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
