import Header from '../components/Header'
import Footer from '../components/Footer'
import { Radio, Cloud, Waves, AlertTriangle, Globe } from 'lucide-react'

export default function OfficialDataPage() {
  const feeds = [
    { name: 'INCOIS Ocean Information', icon: Waves, notes: ['Tsunami bulletins', 'Sea state forecasts', 'Wave height'], status: 'API/RSS' },
    { name: 'IMD Weather', icon: Cloud, notes: ['Cyclone tracks', 'Storm surge outlook', 'Rainfall alerts'], status: 'API/Bulletins' },
    { name: 'NOAA / ESA', icon: Globe, notes: ['Satellite-derived sea level', 'Currents', 'Ocean temps'], status: 'Open Data' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Radio className="h-4 w-4 mr-2" />
              Official Data Integrations
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Agency Feeds</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">We ingest forecasts and alerts from ocean and weather agencies to validate and contextualize citizen reports.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {feeds.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <f.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{f.name}</h3>
                <ul className="space-y-1 mb-3">
                  {f.notes.map((n, idx) => (
                    <li key={idx} className="text-sm text-gray-600">• {n}</li>
                  ))}
                </ul>
                <div className="text-sm text-gray-500">Integration: {f.status}</div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 mt-12 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Scheduling & Refresh</h2>
            <p className="text-gray-600">Server-side jobs poll feeds every few minutes. New alerts are stored in Supabase and visualized on the map. Thresholds can auto-trigger notifications to stakeholders.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}


