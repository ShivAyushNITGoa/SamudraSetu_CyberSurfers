'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import '../../styles/map.css'
import 'leaflet/dist/leaflet.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [roleChecked, setRoleChecked] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/website/auth/admin')
    }
  }, [user, loading, router])

  useEffect(() => {
    const verifyRole = async () => {
      if (loading || !user) return
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        const role = data?.role
        if (!error && role && ['admin','analyst','dmf_head'].includes(role)) {
          setRoleChecked(true)
          return
        }
        // Not an admin role: send to citizen app
        router.replace('/citizen')
      } catch {
        router.replace('/citizen')
      } finally {
        setRoleChecked(true)
      }
    }
    verifyRole()
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !roleChecked) {
    return null
  }

  return (
    <div className="flex h-screen gov-bg">
      {sidebarOpen && (
        <Sidebar />
      )}
      <div className="flex-1 flex flex-col overflow-hidden gov-bg">
        <div className="flex items-center justify-between px-2 bg-[#0f243a] border-b border-[#1f3957]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2 px-3 py-1 rounded-md text-sm bg-[#1b3552] text-white hover:bg-[#214162]"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            {sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          </button>
          <div className="flex-1">
            <Header />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto gov-bg p-4">
          <div className="max-w-7xl mx-auto space-y-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
