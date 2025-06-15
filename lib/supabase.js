import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig.extra.supabaseUrl;
const supabaseKey = Constants.expoConfig.extra.supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
