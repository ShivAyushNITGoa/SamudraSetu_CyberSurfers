import Header from '../components/Header'
import Footer from '../components/Footer'
import { MessageSquare, BarChart3, Activity, Search } from 'lucide-react'

export default function SocialNlpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Search className="h-4 w-4 mr-2" />
              Social Listening & NLP
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Social Signals & AI</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Scheduled jobs fetch Twitter/YouTube data, then NLP classifies hazard relevance and sentiment. Indicators appear alongside citizen reports.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ingestion</h3>
              <p className="text-gray-600">Twitter API v2 (recent search/filtered stream) and YouTube Data API v3 are polled every few minutes. Raw posts are stored in Supabase.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">NLP Processing</h3>
              <p className="text-gray-600">Hazard classification, language normalization, and sentiment analysis (e.g., multilingual models). Irrelevant noise is filtered out.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Indicators</h3>
              <p className="text-gray-600">Trends, hotspots, and sentiment timelines surface on the dashboard for analysts to validate and act upon.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}


