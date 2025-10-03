import Header from '../components/Header'
import Footer from '../components/Footer'
import { Shield, Lock, Key, Database, FileCheck } from 'lucide-react'

export default function SecurityPage() {
  const items = [
    { title: 'Auth & RBAC', icon: Key, text: 'Supabase Auth with role-based access for Citizen, Analyst, and Admin.' },
    { title: 'Row-Level Security', icon: Lock, text: 'RLS policies restrict data visibility by role and ownership.' },
    { title: 'Storage Security', icon: FileCheck, text: 'Media stored in Supabase Storage with signed URL access.' },
    { title: 'Database & Audit', icon: Database, text: 'Postgres with auditing; least-privilege service role and env secrets.' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Security & Governance</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Defense-in-depth across auth, data access, storage, and operational practices.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items.map((it, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <it.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{it.title}</h3>
                <p className="text-gray-600">{it.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}


