import Header from '../components/Header'
import Footer from '../components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <div className="prose max-w-none text-gray-700">
            <p>SamudraSetu respects your privacy. We collect only necessary information to operate the platform and improve coastal safety. Data includes account details, submitted reports (including location and media), and usage analytics.</p>
            <p>Media and data are stored in Supabase (Postgres and Storage). Access is governed by Row-Level Security (RLS) and signed URLs. We do not sell personal data.</p>
            <p>You can request deletion of your account and submissions by contacting support. Some aggregated or anonymized data may be retained for research and safety purposes.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}


