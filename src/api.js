import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const api = {
  getData: async () => {
    const { data, error } = await supabase
      .from('game_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  postData: async (payload) => {
    const { data, error } = await supabase
      .from('game_data')
      .insert([{ message: payload.message }])
      .select();

    if (error) throw error;
    return data;
  },

  updateData: async (id, payload) => {
    const { data, error } = await supabase
      .from('game_data')
      .update({ message: payload.message, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  },

  deleteData: async (id) => {
    const { error } = await supabase
      .from('game_data')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};