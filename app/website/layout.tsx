import type { Metadata } from 'next'
import '../globals.css'
import 'leaflet/dist/leaflet.css'
import '@/styles/map.css'

export const metadata: Metadata = {
  title: 'SamudraSetu - Integrated Ocean Hazard Reporting & Analytics',
  description: 'Crowdsourced ocean hazard reports, official data feeds, social listening, and real-time analytics. Next.js + Flutter with Supabase (Postgres, PostGIS, Auth, Storage, Realtime).',
}

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
