import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://urpzmcvftooacnnwdpqn.supabase.co';
const supabaseAnonKey = 'sb_publishable_C_wIysyBO-74DNU4OSaMqA_ZTKfRSTk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
