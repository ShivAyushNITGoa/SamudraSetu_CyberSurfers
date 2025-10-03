import Header from '../components/Header'
import Footer from '../components/Footer'
import { MapPin, CheckCircle, Clock } from 'lucide-react'

export default function RoadmapPage() {
  const phases = [
    { title: 'MVP (Hackathon)', items: ['Supabase project with PostGIS', 'Flutter app: login + report', 'Next.js dashboard: map + filters', 'Social ingestion scripts (Twitter/YouTube)'] },
    { title: 'Pilot (Odisha, Tamil Nadu)', items: ['Regional deployments', 'Local language support', 'Alert rules & templates', 'Analyst verification workflow'] },
    { title: 'Scale-up', items: ['Nationwide rollout', 'Advanced NLP models', 'Vector tiles and caching', 'Data export and APIs'] },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Clock className="h-4 w-4 mr-2" />
              Roadmap
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Implementation Roadmap</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Phased plan from MVP to nationwide deployment, focusing on high-risk coastal regions first.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {phases.map((phase, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{phase.title}</h3>
                <ul className="space-y-2">
                  {phase.items.map((it, idx) => (
                    <li key={idx} className="text-sm text-gray-600">• {it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}


