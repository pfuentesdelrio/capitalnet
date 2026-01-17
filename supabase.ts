import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yqjbffstsvfckperbwlc.supabase.co';
const supabaseAnonKey = 'sb_publishable_7SRH1osF-8Zmc54vyTUirQ_cq8gnVM1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
