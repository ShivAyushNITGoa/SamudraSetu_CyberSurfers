'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { createUserProfile } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const timeoutRef = (typeof window !== 'undefined') ? (window as any)._sessionTimeoutRef as { id?: any } | undefined : undefined

  // Handle user profile creation asynchronously to avoid blocking sign-in
  const handleUserProfileAsync = async (user: User) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile && user.email_confirmed_at) {
        // Create user profile after email confirmation
        await createUserProfile(
          user.id,
          user.email!,
          user.user_metadata?.name || user.email!.split('@')[0]
        )
      }
    } catch (error) {
      console.error('Error handling user profile:', error)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Handle profile creation asynchronously to avoid blocking sign-in
        if (event === 'SIGNED_IN' && session?.user) {
          // Don't await this - let it run in background
          handleUserProfileAsync(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // Auto sign-out after inactivity based on settings.security.sessionTimeout (minutes)
    const setupTimer = () => {
      try {
        const raw = localStorage.getItem('app_settings')
        const minutes = raw ? (JSON.parse(raw)?.security?.sessionTimeout ?? '30') : '30'
        const ms = Math.max(1, parseInt(String(minutes), 10)) * 60 * 1000
        const reset = () => {
          if ((window as any)._sessionTimeoutId) clearTimeout((window as any)._sessionTimeoutId)
          ;(window as any)._sessionTimeoutId = setTimeout(() => {
            supabase.auth.signOut()
          }, ms)
        }
        ;['click','keydown','mousemove','scroll','touchstart'].forEach(ev => window.addEventListener(ev, reset, { passive: true }))
        reset()
        return () => {
          if ((window as any)._sessionTimeoutId) clearTimeout((window as any)._sessionTimeoutId)
          ;['click','keydown','mousemove','scroll','touchstart'].forEach(ev => window.removeEventListener(ev, reset as any))
        }
      } catch {
        return () => {}
      }
    }
    const cleanup = setupTimer()
    return cleanup
  }, [user])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
