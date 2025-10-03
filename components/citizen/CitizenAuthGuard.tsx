'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { getUserRoleFromProfile } from '@/lib/auth'
import LoadingSpinner from '@/components/LoadingSpinner'
import { supabase } from '@/lib/supabase'

interface CitizenAuthGuardProps {
  children: React.ReactNode
}

export default function CitizenAuthGuard({ children }: CitizenAuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<'admin' | 'citizen' | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)
  const redirectingRef = useRef(false)

  useEffect(() => {
    const checkUserAccess = async () => {
      if (loading) {
        // Still loading, keep showing loading state
        return
      }

      if (user) {
        try {
          // Citizen app allows any email domain
          setUserRole('citizen')
        } catch (error) {
          console.error('Error checking user access:', error)
          setUserRole('citizen') // Default to citizen on error
        }
        setRoleLoading(false)
        return
      }

      // No user yet: double-check session before redirecting to avoid loops
      try {
        const { data } = await supabase.auth.getSession()
        if (data?.session?.user) {
          // Session exists but context not updated yet; allow through
          setUserRole('citizen')
          setRoleLoading(false)
          return
        }
      } catch (e) {
        // ignore and proceed to redirect
      }

      if (!redirectingRef.current) {
        redirectingRef.current = true
        setRoleLoading(false)
        router.replace('/website/auth/citizen')
      }
    }

    checkUserAccess()
  }, [user, loading, pathname, router])

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  // Citizen app allows any user

  return <>{children}</>
}
