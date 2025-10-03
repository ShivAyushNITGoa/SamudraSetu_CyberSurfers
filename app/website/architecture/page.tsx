import Header from '../components/Header'
import Footer from '../components/Footer'
import { Server, Database, Globe, Smartphone, Layers, Map, Activity, Shield } from 'lucide-react'

export default function ArchitecturePage() {
  const layers = [
    { title: 'Frontend - Web (Next.js)', icon: Globe, points: ['SSR dashboard for officials', 'Realtime subscriptions', 'MapLibre/Leaflet with OSM', 'RBAC UI controls'] },
    { title: 'Frontend - Mobile (Flutter)', icon: Smartphone, points: ['Offline queue & sync', 'Supabase Auth integration', 'GPS, camera, media upload', 'i18n for Indian languages'] },
    { title: 'Backend (Node/Next API Routes)', icon: Server, points: ['REST endpoints & cron jobs', 'Social feed ingestion', 'Alert rules execution', 'Bridges to Supabase'] },
    { title: 'Supabase (Postgres + PostGIS)', icon: Database, points: ['Auth & RLS policies', 'Storage for media', 'Realtime (WebSockets)', 'Spatial indexes & queries'] },
    { title: 'Analytics & NLP', icon: Activity, points: ['Hazard classification', 'Sentiment analysis', 'Hotspot detection', 'Trends & indicators'] },
    { title: 'Mapping', icon: Map, points: ['OpenStreetMap tiles', 'Clusters/Heatmaps', 'Hotspot overlays', 'Vector layers (optional)'] },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Layers className="h-4 w-4 mr-2" />
              Architecture
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Integrated Platform Architecture</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Next.js dashboard, Flutter mobile, and Supabase (Postgres + PostGIS, Auth, Storage, Realtime) working together for real-time coastal hazard intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {layers.map((layer, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                    <layer.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{layer.title}</h3>
                </div>
                <ul className="space-y-2">
                  {layer.points.map((p, idx) => (
                    <li key={idx} className="text-gray-600 text-sm">• {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 mt-12 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Security Model</h2>
            <p className="text-gray-600 mb-4">Supabase Auth with role-based access (Citizen, Analyst, Admin). Row-Level Security (RLS) ensures users only see authorized data. Media stored in Supabase Storage with signed URLs. Realtime uses secure channels per role.</p>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>Least-privilege service roles; environment secrets for API keys; audit trails.</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}


