import { createClient } from '@supabase/supabase-js'

const DEFAULT_URL = 'https://btaowwragwlklrcpeuuc.supabase.co'
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0YW93d3JhZ3dsa2xyY3BldXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMDY0NDksImV4cCI6MjEwNTU4MjQ0OX0.tybS76LluWofhkyj2VBWbtINUCtj8nEk0gSbcA-YOM8'

// If environment variable is missing, invalid, or pointing to old project, use the active Supabase project
const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const SUPABASE_URL = (envUrl && envUrl.includes('supabase.co') && !envUrl.includes('oepfawsnbufhsdwewuei')) 
  ? envUrl 
  : DEFAULT_URL

const SUPABASE_ANON_KEY = (envKey && envKey.length > 50 && !envUrl?.includes('oepfawsnbufhsdwewuei')) 
  ? envKey 
  : DEFAULT_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
