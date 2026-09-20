import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and Anon Key from localStorage or environment if available
const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem('nbass_supabase_url');
  const localKey = localStorage.getItem('nbass_supabase_key');
  
  const url = localUrl || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  return { url, key };
};

let { url, key } = getSupabaseConfig();

export const isSupabaseConfigured = () => {
  return Boolean(url && key && url.startsWith('http'));
};

export const createSupabaseClient = () => {
  const config = getSupabaseConfig();
  if (config.url && config.key && config.url.startsWith('http')) {
    try {
      return createClient(config.url, config.key);
    } catch (e) {
      console.error('Failed to init Supabase client:', e);
    }
  }
  return null;
};

export const saveSupabaseConfig = (newUrl: string, newKey: string) => {
  localStorage.setItem('nbass_supabase_url', newUrl);
  localStorage.setItem('nbass_supabase_key', newKey);
  url = newUrl;
  key = newKey;
};
