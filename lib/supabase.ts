import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | any

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase env not configured')
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
} catch (e) {
  console.error('Missing Supabase environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
  const err = new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  const noop = () => ({ data: { subscription: { unsubscribe() {} } } })
  supabase = {
    auth: {
      getUser: async () => { throw err },
      signInWithPassword: async () => { throw err },
      signUp: async () => { throw err },
      signOut: async () => { throw err },
      onAuthStateChange: noop,
      resend: async () => { throw err },
    },
    from: () => ({
      select: () => { throw err },
      insert: () => { throw err },
      update: () => { throw err },
      eq: () => { throw err },
      single: () => { throw err },
      limit: () => { throw err },
      order: () => { throw err },
    }),
    rpc: async () => { throw err },
  }
}

export { supabase }

// Database types based on the new schema
export interface Profile {
  id: string
  email: string
  name: string
  role: 'citizen' | 'admin' | 'analyst' | 'dmf_head'
  phone?: string
  department?: string
  avatar_url?: string
  language_preference: string
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  location: {
    latitude: number
    longitude: number
  }
  address: string
  media_urls: string[]
  user_id: string
  assigned_to?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  admin_notes?: string
}

export interface ReportComment {
  id: string
  report_id: string
  user_id: string
  user_name?: string
  comment: string
  created_at: string
}

export interface Department {
  id: string
  name: string
  contact_email: string
  created_at: string
}

// Legacy interface for backward compatibility
export interface CivicIssue extends Report {
  reporter_id: string
  reporter_name: string
  reporter_email: string
  images: string[]
}
