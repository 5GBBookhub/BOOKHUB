import { createClient } from '@supabase/supabase-js'

const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

const createMockSupabaseClient = () => ({
  from: () => ({
    select: async () => ({ data: [], error: null }),
    upsert: async () => ({ error: null }),
    delete: () => ({
      in: async () => ({ error: null }),
    }),
  }),
  rpc: async () => ({ data: null, error: null }),
})

export const supabase = hasSupabaseConfig
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    )
  : createMockSupabaseClient()