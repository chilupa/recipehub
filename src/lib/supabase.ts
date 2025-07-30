import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jxxfeflrecgbcfihdkjv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eGZlZmxyZWNnYmNmaWhka2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4Mzk0MTUsImV4cCI6MjA2OTQxNTQxNX0.Rn8Z_mP6p6GEfL_AVLFJd6JqHjpwWO8aM58XEmLb2-4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)