import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import { 
  UserPlus, 
  MapPin, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  MessageSquare,
  BarChart3,
  Smartphone,
  Globe,
  Users,
  Database,
  Radio,
  Activity,
  Layers
} from 'lucide-react'

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: "Citizen Submits Hazard",
      description: "Flutter app or web portal captures GPS, hazard type, description, and media. Offline-capable with sync.",
      icon: UserPlus,
      color: "blue"
    },
    {
      number: 2,
      title: "Data Stored in Supabase",
      description: "Auth tokens secure writes to Postgres with RLS; media stored in Supabase Storage.",
      icon: Database,
      color: "green"
    },
    {
      number: 3,
      title: "Geospatial Indexing",
      description: "Locations saved as PostGIS geography(Point) with GiST index for fast geoqueries.",
      icon: MapPin,
      color: "purple"
    },
    {
      number: 4,
      title: "Social + Official Feeds",
      description: "Scheduled jobs fetch Twitter/YouTube and official bulletins (INCOIS/IMD) into Supabase.",
      icon: Radio,
      color: "orange"
    },
    {
      number: 5,
      title: "NLP & Analytics",
      description: "Classify hazard type, sentiment, and relevance; compute hotspots and trends for the dashboard.",
      icon: Activity,
      color: "indigo"
    },
    {
      number: 6,
      title: "Live Dashboard",
      description: "Next.js map with clustering/heatmap updates in real time via Supabase Realtime.",
      icon: Layers,
      color: "cyan"
    }
  ]

  const features = [
    {
      title: "Multi-Platform Access",
      description: "Next.js dashboard (officials), Flutter citizen app (Android/iOS)",
      icon: Globe,
      platforms: ["Dashboard (RBAC)", "Flutter App", "Public Map"]
    },
    {
      title: "Realtime & Alerts",
      description: "Realtime subscriptions and configurable email/SMS/push notifications",
      icon: MessageSquare,
      platforms: ["Supabase Realtime", "Email/SMS", "Push (FCM)"]
    },
    {
      title: "Analytics & Hotspots",
      description: "PostGIS densities, clusters, and sentiment timelines",
      icon: BarChart3,
      platforms: ["Heatmaps", "Trends", "Verification Workflow"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              How <span className="gradient-text">SamudraSetu</span> Works
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              An integrated flow connecting citizen reports, social listening, and official feeds into a secure, real-time geospatial dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              End-to-End Data Flow
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From citizen submission to verified insights and alerts, powered by Supabase + PostGIS.
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col lg:flex-row items-center gap-8">
                <div className={`flex-shrink-0 w-20 h-20 bg-${step.color}-100 rounded-2xl flex items-center justify-center`}>
                  <step.icon className={`h-10 w-10 text-${step.color}-600`} />
                </div>
                
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 text-lg">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Key Features & Capabilities
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Optimized for coastal hazards: mapping, realtime, multilingual, and verification workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.platforms.map((platform, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {platform}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              User Roles & Access
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Roles enforced with Supabase Auth and RLS policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Citizens / Volunteers</h3>
              <ul className="space-y-2 text-left">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Report coastal hazards with GPS and media
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Track verification status and alerts
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Multilingual UI (Hindi, Tamil, Bengali, English)
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Offline queue and sync on reconnect
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analysts / Response Teams</h3>
              <ul className="space-y-2 text-left">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  View all raw reports and social indicators
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Verify/flag reports and tag events
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  View trends, hotspots, and sentiment
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Export data for modeling
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Administrators</h3>
              <ul className="space-y-2 text-left">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Manage users and permissions
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Approve incident alerts and thresholds
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Integrate official data feeds
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  System configuration
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Next.js + Flutter frontend, Supabase backend with Postgres/PostGIS, and open map SDKs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Next.js</h3>
              <p className="text-sm text-gray-600">Web Dashboard (SSR, API Routes)</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Flutter</h3>
              <p className="text-sm text-gray-600">Mobile App (Offline, i18n)</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Supabase</h3>
              <p className="text-sm text-gray-600">Auth, Storage, Realtime</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">TypeScript</h3>
              <p className="text-sm text-gray-600">Type Safety</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Explore SamudraSetu?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Open the citizen portal or login as admin/analyst to view the live dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/website/auth/citizen"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Users className="h-5 w-5 mr-2" />
              Open Citizen Portal
            </Link>
            
            <Link
              href="/website/auth/admin"
              className="inline-flex items-center px-8 py-4 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Shield className="h-5 w-5 mr-2" />
              Admin Access
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
