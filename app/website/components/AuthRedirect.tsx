'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { isAdminEmail } from '@/lib/auth'

export default function AuthRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const checkUserAccess = async () => {
      if (isMounted && !loading && user) {
        try {
          // Check if user has admin-eligible email domain
          const adminEligible = user.email ? isAdminEmail(user.email) : false
          console.log('AuthRedirect: Email domain check:', adminEligible, 'for email:', user.email)
          
          if (adminEligible) {
            console.log('AuthRedirect: Redirecting admin user to dashboard')
            router.push('/dashboard')
          } else {
            console.log('AuthRedirect: Redirecting citizen user to citizen app')
            router.push('/citizen')
          }
        } catch (error) {
          console.error('Error checking user access:', error)
          // Default to citizen on error
          router.push('/citizen')
        }
      }
    }

    checkUserAccess()
  }, [isMounted, user, loading, router])

  // Don't render anything, just handle redirects
  return null
}
