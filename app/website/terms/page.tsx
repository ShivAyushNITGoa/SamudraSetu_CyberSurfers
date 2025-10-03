import Header from '../components/Header'
import Footer from '../components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <div className="prose max-w-none text-gray-700">
            <p>By using SamudraSetu, you agree to submit accurate information and avoid misuse. Reports may be reviewed by analysts and administrators for verification.</p>
            <p>Access to certain features depends on your role (Citizen, Analyst, Admin). We may update these terms as the platform evolves. Continued use constitutes acceptance of changes.</p>
            <p>SamudraSetu is provided as-is during pilot phases. We are not liable for damages arising from inaccurate or delayed information. Always follow official guidance during emergencies.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}


