import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import { 
  Users, 
  Code, 
  Globe, 
  Heart, 
  Award, 
  Target, 
  Lightbulb,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  ExternalLink,
  Database,
  Shield,
  Map as MapIcon,
  Radio,
  Activity
} from 'lucide-react'

export default function AboutPage() {
  const teamValues = [
    {
      title: "Innovation",
      description: "Applying practical tech (Next.js, Flutter, Supabase) for real-time hazard response.",
      icon: Lightbulb,
      color: "blue"
    },
    {
      title: "Reliability",
      description: "Cloud-native architecture with secure auth, RLS, and resilient data pipelines.",
      icon: Award,
      color: "green"
    },
    {
      title: "Impact",
      description: "Protecting coastal communities by merging citizen reports with official data.",
      icon: Target,
      color: "purple"
    },
    {
      title: "Collaboration",
      description: "Co-building with agencies and volunteers for trusted situational awareness.",
      icon: Users,
      color: "orange"
    }
  ]

  const technologies = [
    { name: "Next.js + Node", category: "Web Dashboard", description: "Role-based dashboard with SSR, API routes" },
    { name: "Flutter", category: "Citizen App", description: "Cross-platform app with offline cache & i18n" },
    { name: "Supabase (Postgres)", category: "Backend", description: "Auth, Storage, Realtime, RLS policies" },
    { name: "PostGIS", category: "Geospatial", description: "Spatial types, indexes, fast geoqueries" },
    { name: "MapLibre / Leaflet", category: "Maps", description: "OpenStreetMap tiles, clusters & heatmaps" },
    { name: "NLP + Sentiment", category: "Analytics", description: "Hazard classification and sentiment scoring" }
  ]

  const milestones = [
    {
      year: "2025",
      title: "SamudraSetu MVP",
      description: "Integrated citizen reports, social signals, and official feeds"
    },
    {
      year: "2025",
      title: "Realtime & Geospatial",
      description: "Supabase Realtime with PostGIS-powered hotspot analytics"
    },
    {
      year: "2025",
      title: "Multi-language & Offline",
      description: "Flutter i18n and local queue with sync-on-connect"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8">
              <Users className="h-4 w-4 mr-2" />
              About SamudraSetu
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Integrated Ocean Hazard Platform <span className="gradient-text">SamudraSetu</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              SamudraSetu bridges coastal communities and disaster management using a unified cloud stack: 
              Next.js dashboard for officials, Flutter app for citizens, and Supabase for Auth, Postgres/PostGIS, Storage, and Realtime.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/website/how-it-works"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Activity className="h-5 w-5 mr-2" />
                See How It Works
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              
              <Link
                href="/website/downloads"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200"
              >
                <Globe className="h-5 w-5 mr-2" />
                Get the App
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Deliver timely, trusted coastal hazard awareness by merging citizen reports, social listening, and official feeds
                into one actionable view for analysts and administrators.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                SamudraSetu enables GPS-tagged reporting, media uploads, multilingual UI, and secure RBAC so the right people see the right data.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Heart className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-gray-600">Community First</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-600">Open Stack</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">SS</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Platform Highlights</h3>
                <p className="text-gray-600 mb-6">Next.js dashboard • Flutter mobile • Supabase Postgres/PostGIS • Realtime</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    Focus: Indian coastal regions (expandable nationwide)
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Globe className="h-4 w-4 mr-2" />
                    OpenStreetMap tiles, MapLibre/Leaflet visualizations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do and every solution we create.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamValues.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-shadow">
                <div className={`w-16 h-16 bg-${value.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <value.icon className={`h-8 w-8 text-${value.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Integrated Architecture & Tech Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cloud-based, mobile+web system connecting citizens, analysts, and official data sources securely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{tech.name}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {tech.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Key milestones delivering a reliable, real-time ocean hazard platform.
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{milestone.year}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Links */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Get Involved
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore the dashboard, try the mobile app, or connect an official data feed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin/Analyst Access</h3>
              <p className="text-gray-600 mb-4">Role-based login for officials and teams</p>
              <Link
                href="/website/auth/admin"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Go to Admin Login
                <ExternalLink className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Radio className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Official Data Feeds</h3>
              <p className="text-gray-600 mb-4">INCOIS/IMD, OGD India, NOAA, ESA integration ready</p>
              <Link
                href="/website/how-it-works"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
              >
                Learn Integration Flow
                <ExternalLink className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Citizen App</h3>
              <p className="text-gray-600 mb-4">Report hazards with GPS, photos, and local language</p>
              <Link
                href="/website/auth/citizen"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
              >
                Open Citizen Portal
                <ExternalLink className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Follow Our Journey
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Updates on features, integrations, and coastal pilot programs.
            </p>
            
            <div className="flex justify-center space-x-6">
              <a
                href="#"
                aria-label="GitHub"
                className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
              >
                <Github className="h-6 w-6" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center text-white hover:bg-blue-800 transition-colors"
              >
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Strengthen Coastal Resilience?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Try the dashboard, submit a sample report, and see real-time updates on the map.
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
              <Code className="h-5 w-5 mr-2" />
              Admin Access
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
