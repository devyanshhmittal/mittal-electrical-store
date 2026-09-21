import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://btaowwragwlklrcpeuuc.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0YW93d3JhZ3dsa2xyY3BldXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMDY0NDksImV4cCI6MjEwNTU4MjQ0OX0.tybS76LluWofhkyj2VBWbtINUCtj8nEk0gSbcA-YOM8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
