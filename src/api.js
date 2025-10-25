import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const api = {
  createGame: async () => {
    const { data, error } = await supabase
      .from('games')
      .insert({})
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getGame: async (id) => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  updateGame: async (id, updates) => {
    const { data, error } = await supabase
      .from('games')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteGame: async (id) => {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};
