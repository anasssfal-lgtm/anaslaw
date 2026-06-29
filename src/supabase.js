import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ywvplhnatwosvlwshxuu.supabase.co'
const supabaseKey = 'sb_publishable_HXbJr21dQ9AIxSgQA4RJAg_Ull_sczU'

export const supabase = createClient(supabaseUrl, supabaseKey)