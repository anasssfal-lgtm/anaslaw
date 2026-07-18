import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ywvplhnatwosvlwshxuu.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_HXbJr21dQ9AIxSgQA4RJAg_Ull_sczU'

export const supabase = createClient(supabaseUrl, supabaseKey)