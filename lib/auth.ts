import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export const isValidEmail = (email: string): boolean => {
  // Allow any syntactically valid email for citizen sign-up/login
  // Simple RFC 5322-like check; keep lightweight on client
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const isAdminEmail = (email: string): boolean => {
  // Allow organization and gmail emails for admin/analyst access in this environment
  const lower = email.toLowerCase()
  return lower.endsWith('@nitgoa.ac.in') || lower.endsWith('@gmail.com')
}

export const getUserRoleFromEmail = (email: string): 'admin' | 'citizen' => {
  return isAdminEmail(email) ? 'admin' : 'citizen'
}

export const signUp = async (email: string, password: string, name: string, additionalData?: any) => {
  if (!isValidEmail(email)) {
    throw new Error('Only @nitgoa.ac.in and @gmail.com emails are allowed')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        ...additionalData,
      },
    },
  })

  // Return both user and error for proper error handling
  return { user: data.user, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Return both user and error for proper error handling
  return { user: data.user, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export const createUserProfile = async (userId: string, email: string, name: string) => {
  const userRole = getUserRoleFromEmail(email)

  const res = await fetch('/api/profiles/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: userId, email, name, role: userRole })
  })

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Profile create failed' }))
    throw new Error(error || 'Profile create failed')
  }

  const { profile } = await res.json()
  return profile
}

export const updateUserRole = async (userId: string, role: string) => {
  console.log('Updating user role:', { userId, role })
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()

  if (error) {
    console.error('Error updating user role:', error)
    throw error
  }
  
  console.log('User role updated successfully:', data)
  return data
}

export const updateAllUsersToCorrectRole = async () => {
  console.log('Updating all users to correct role based on email domain...')
  
  // First, get all profiles
  const { data: profiles, error: fetchError } = await supabase
    .from('profiles')
    .select('id, email, role')

  if (fetchError) {
    console.error('Error fetching profiles:', fetchError)
    throw fetchError
  }

  if (!profiles || profiles.length === 0) {
    console.log('No profiles found to update')
    return []
  }

  const updates = []
  
  for (const profile of profiles) {
    const correctRole = getUserRoleFromEmail(profile.email)
    
    // Only update if role is incorrect
    if (profile.role !== correctRole) {
      console.log(`Updating ${profile.email} from ${profile.role} to ${correctRole}`)
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: correctRole })
        .eq('id', profile.id)
        .select()

      if (error) {
        console.error(`Error updating profile ${profile.email}:`, error)
      } else {
        updates.push(data[0])
      }
    } else {
      console.log(`${profile.email} already has correct role: ${profile.role}`)
    }
  }
  
  console.log(`Updated ${updates.length} profiles to correct roles`)
  return updates
}

export const resendConfirmation = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) throw error
}

export const checkAndFixRLSPolicies = async () => {
  console.log('Checking RLS policies for profiles table...')
  
  try {
    // Check if RLS is enabled
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('check_rls_enabled', { table_name: 'profiles' })
    
    console.log('RLS check result:', { rlsData, rlsError })
    
    // Try to create a simple policy if needed
    const { data: policyData, error: policyError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    console.log('Policy test result:', { policyData, policyError })
    
    return {
      success: !policyError,
      error: policyError?.message,
      rlsEnabled: rlsData,
      canRead: !!policyData
    }
  } catch (error) {
    console.error('Error checking RLS policies:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
