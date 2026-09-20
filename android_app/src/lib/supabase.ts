import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qnkbekaaxsgenofnmuab.supabase.co';
const SUPABASE_KEY = 'sb_publishable_v8BiOkwtlXWTPCsLOGOv8A_G_9b8sWE';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

export const isSupabaseConnected = true;
