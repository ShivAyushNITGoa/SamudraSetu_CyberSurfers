"use client"
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const Header = dynamic(() => import('./components/Header'), { ssr: false })
const Footer = dynamic(() => import('./components/Footer'), { ssr: false })
const OceanHazardMap = dynamic(() => import('../../components/OceanHazardMap'), { ssr: false })
import Link from 'next/link'
import { 
  Shield, 
  Globe, 
  Smartphone, 
  Users, 
  MapPin, 
  MessageSquare, 
  BarChart3, 
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Download,
  Play,
  Waves,
  CloudRain,
  Wind,
  Droplets,
  Sun,
  Cloud,
  Navigation,
  AlertTriangle,
  TrendingUp,
  Eye
} from 'lucide-react'

export default function HomePage() {
  const [liveReports, setLiveReports] = useState<any[]>([])
  const [loadingReports, setLoadingReports] = useState<boolean>(false)
  // Fetch oceanographic data from INCOIS LAS
  const fetchOceanographicData = async () => {
    try {
      const response = await fetch('/api/official-data/las/oceanographic?parameter=sea_surface_height&parameter=significant_wave_height', { 
        cache: 'no-store' 
      })
      if (response.ok) {
        const data = await response.json()
        return data
      }
    } catch (error) {
      console.error('Failed to fetch oceanographic data:', error)
    }
    return null
  }

  const demoReports = [
    {
      id: 'r1',
      title: 'High waves near Chennai',
      description: 'Unusually high waves observed from shore.',
      hazard_type: 'unusual_tides',
      severity: 'high',
      status: 'unverified',
      location: { latitude: 13.0827, longitude: 80.2707 },
      created_at: new Date().toISOString(),
      confidence_score: 0.72,
      social_media_indicators: { tweet_count: 34, sentiment_score: -0.2, trending_keywords: ['waves', 'tide'] }
    },
    {
      id: 'r2',
      title: 'Coastal flooding reported',
      description: 'Water ingress into low-lying area near harbor.',
      hazard_type: 'flooding',
      severity: 'critical',
      status: 'under_review',
      location: { latitude: 19.0760, longitude: 72.8777 },
      created_at: new Date().toISOString(),
      confidence_score: 0.86,
      social_media_indicators: { tweet_count: 112, sentiment_score: -0.5, trending_keywords: ['flood', 'harbor'] }
    },
    {
      id: 'r3',
      title: 'Erosion near seawall',
      description: 'Visible erosion and debris after high tide.',
      hazard_type: 'erosion',
      severity: 'medium',
      status: 'unverified',
      location: { latitude: 9.9312, longitude: 76.2673 },
      created_at: new Date().toISOString(),
      confidence_score: 0.64,
      social_media_indicators: { tweet_count: 12, sentiment_score: -0.1, trending_keywords: ['erosion'] }
    }
  ]
  // INCOIS: Past 90 days events (live)
  const [incoisEvents, setIncoisEvents] = useState<any[]>([])
  useEffect(() => {
    const loadIncois = async () => {
      try {
        const r = await fetch('/api/official-data/incois/past90days', { cache: 'no-store' })
        if (!r.ok) return
        const j = await r.json()
        const datasets = j?.data?.datasets || []
        const mapped = datasets.map((d: any) => ({
    id: d.EVID,
          title: `${Number(d.MAGNITUDE).toFixed(1)}M event`,
    description: `${d.REGIONNAME} • ${d.ORIGINTIME}`,
    hazard_type: 'tsunami',
          severity: Number(d.MAGNITUDE) >= 8 ? 'critical' : Number(d.MAGNITUDE) >= 7 ? 'high' : 'medium',
    status: 'unverified',
          location: { latitude: Number(d.LATITUDE), longitude: Number(d.LONGITUDE) },
          created_at: new Date(String(d.ORIGINTIME).replace(' ', 'T') + 'Z').toISOString(),
          confidence_score: Math.min(0.95, Math.max(0.6, (Number(d.MAGNITUDE) - 6) / 3)),
          social_media_indicators: {}
        }))
        setIncoisEvents(mapped)
      } catch {}
    }
    loadIncois()
  }, [])
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    if (!supabaseUrl || !supabaseAnon) return
    const client = createClient(supabaseUrl, supabaseAnon)
    const load = async () => {
      try {
        setLoadingReports(true)
        const { data, error } = await client
          .from('view_public_reports_geojson')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)
        if (error) throw error
        const mapped = (data || []).map((r: any) => ({
          ...r,
          location: {
            latitude: Number(r.location?.coordinates?.[1] ?? 0),
            longitude: Number(r.location?.coordinates?.[0] ?? 0)
          }
        }))
        setLiveReports(mapped)
      } catch (e) {
        console.warn('Failed to load live reports:', e)
        setLiveReports([])
      } finally {
        setLoadingReports(false)
      }
    }
    load()

    // Realtime subscription for public report updates
    const channel = (client as any).channel('website_reports_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ocean_hazard_reports' }, () => load())
      .subscribe()

    return () => {
      try { (client as any).removeChannel(channel) } catch {}
    }
  }, [])

  const mapReports = [...liveReports, ...incoisEvents]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8">
              <Waves className="h-4 w-4 mr-2" />
              Integrated Ocean Hazard Reporting Platform
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="gradient-text">SamudraSetu</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Bridging the gap between coastal communities and disaster management through technology. 
              Report, monitor, and respond to ocean hazards with our comprehensive platform powered by crowdsourcing and social media analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/website/auth/citizen"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Waves className="h-5 w-5 mr-2" />
                Report Ocean Hazards
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>

              <Link
                href="/website/auth/admin"
                className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Shield className="h-5 w-5 mr-2" />
                Disaster Management Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>

              <Link
                href="/website/how-it-works"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200"
              >
                <Play className="h-5 w-5 mr-2" />
                How It Works
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-float-delay-1"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-200 rounded-full opacity-20 animate-float-delay-2"></div>
      </section>

  {/* Architecture & Tech Stack (Gov-style section) */}
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Integrated Platform Architecture</h2>
          <p className="text-gray-700 mb-6">
            Cloud-based, mobile + web system designed for India-scale readiness. Built with Next.js for officials, Flutter for citizens, and Supabase for secured data, auth, storage and realtime sync. PostGIS powers geospatial analytics; RBAC and RLS safeguard sensitive data.
          </p>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start"><CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />Next.js Dashboard (SSR), Flutter Mobile App</li>
            <li className="flex items-start"><CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />Supabase: Postgres + PostGIS, Auth, Storage, Realtime</li>
            <li className="flex items-start"><CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />RBAC & Row-Level Security for Citizen/Analyst/Admin</li>
            <li className="flex items-start"><CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />OpenStreetMap + clustering/heatmap for hotspots</li>
            <li className="flex items-start"><CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />APIs for INCOIS/IMD/NOAA overlays and early warnings</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-white rounded-xl border">
              <div className="text-gray-400 text-xs">Frontend</div>
              <div className="font-semibold text-gray-900">Next.js + Tailwind</div>
            </div>
            <div className="p-4 bg-white rounded-xl border">
              <div className="text-gray-400 text-xs">Mobile</div>
              <div className="font-semibold text-gray-900">Flutter (iOS/Android)</div>
            </div>
            <div className="p-4 bg-white rounded-xl border">
              <div className="text-gray-400 text-xs">Backend</div>
              <div className="font-semibold text-gray-900">Next.js API (Node)</div>
            </div>
            <div className="p-4 bg-white rounded-xl border">
              <div className="text-gray-400 text-xs">Data Layer</div>
              <div className="font-semibold text-gray-900">Supabase Postgres + PostGIS</div>
            </div>
            <div className="p-4 bg-white rounded-xl border">
              <div className="text-gray-400 text-xs">Auth & RLS</div>
              <div className="font-semibold text-gray-900">RBAC, RLS Policies</div>
            </div>
            <div className="p-4 bg-white rounded-xl border">
              <div className="text-gray-400 text-xs">Realtime</div>
              <div className="font-semibold text-gray-900">WebSockets Sync</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* Social Monitoring & NLP (4-point capability) */}
  <section className="py-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Social Monitoring & NLP</h2>
        <p className="text-gray-600">Continuous Twitter/YouTube listening with multilingual hazard intelligence.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-white rounded-2xl border">
          <div className="text-sm font-semibold text-blue-700 mb-2">1. Hazard Event Detection</div>
          <p className="text-gray-700 mb-3">Track spikes for “tsunami”, “cyclone”, “storm surge”, “flood”, and regional-language variants via Recent Search/Filtered Stream.</p>
          <div className="text-xs text-gray-500">Outcome: Early detection of emerging events ahead of bulletins.</div>
        </div>
        <div className="p-6 bg-white rounded-2xl border">
          <div className="text-sm font-semibold text-green-700 mb-2">2. Geotagged Community Reports</div>
          <p className="text-gray-700 mb-3">Collect tweets with geo/places; NLP to extract location names for coastal districts.</p>
          <div className="text-xs text-gray-500">Outcome: Validate and map citizen observations to districts.</div>
        </div>
        <div className="p-6 bg-white rounded-2xl border">
          <div className="text-sm font-semibold text-purple-700 mb-2">3. Sentiment & Urgency Analysis</div>
          <p className="text-gray-700 mb-3">Classify public mood (panic/awareness/info-sharing) with multilingual sentiment and urgency scoring.</p>
          <div className="text-xs text-gray-500">Outcome: Calibrate comms and on-ground response.</div>
        </div>
        <div className="p-6 bg-white rounded-2xl border">
          <div className="text-sm font-semibold text-red-700 mb-2">4. Rumor & Misinformation Tracking</div>
          <p className="text-gray-700 mb-3">Detect false claims, trending rumors, and misinformation patterns for moderation workflows.</p>
          <div className="text-xs text-gray-500">Outcome: Enable rapid clarifications by authorities.</div>
        </div>
      </div>
    </div>
  </section>
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Complete Solution for Ocean Hazard Management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three powerful applications working together to create a comprehensive ocean hazard monitoring and response ecosystem.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Admin Dashboard */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">SamudraSetu Disaster Management Dashboard</h3>
              <p className="text-gray-600 mb-6">
                Comprehensive management interface for disaster management officials to monitor, verify, and respond to ocean hazard reports with real-time analytics.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-time Hazard Monitoring
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Social Media Analytics
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Alert & Notification System
                </li>
              </ul>
              <Link
                href="/website/admin-app"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Learn More
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* Citizen Web App */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Waves className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">SamudraSetu Citizen Portal</h3>
              <p className="text-gray-600 mb-6">
                User-friendly interface for coastal communities to report ocean hazards, track verification status, and stay informed about nearby threats.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  GPS-enabled Hazard Reporting
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-time Map View
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Multilingual Support
                </li>
              </ul>
              <Link
                href="/website/citizen-app"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
              >
                Learn More
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* Mobile App */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">SamudraSetu Mobile App</h3>
              <p className="text-gray-600 mb-6">
                Native mobile application for iOS and Android, providing on-the-go access to ocean hazard reporting with offline capabilities.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Offline Report Submission
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  GPS & Camera Integration
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Emergency Alerts
                </li>
              </ul>
              <Link
                href="/website/mobile-app"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
              >
                Learn More
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to enhance ocean hazard monitoring, response, and community safety.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Waves className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ocean Hazard Detection</h3>
              <p className="text-gray-600 text-sm">Advanced detection of tsunamis, storm surges, and coastal threats</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Media Analytics</h3>
              <p className="text-gray-600 text-sm">Real-time monitoring of social media for hazard indicators</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Alerts</h3>
              <p className="text-gray-600 text-sm">Instant alerts and notifications to coastal communities</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multilingual Support</h3>
              <p className="text-gray-600 text-sm">Support for Hindi, Tamil, Bengali, and English languages</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Map */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Live Coastal Hazard Map
            </h2>
            <p className="text-gray-600">Clusters and heatmaps powered by PostGIS-ready data. Token required to view.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[480px] rounded-2xl overflow-hidden border border-gray-200">
              <OceanHazardMap reports={mapReports as any} viewMode="clusters" />
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Today’s Snapshot</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• {incoisEvents.length} INCOIS events (past 90 days)</li>
                <li>• Live INCOIS feed + Supabase reports</li>
                <li>• Click clusters to explore points</li>
                <li>• Severity scaled by magnitude</li>
              </ul>
              <p className="text-xs text-gray-500 mt-4">Maps powered by free OpenStreetMap - no API key required!</p>
              <p className="text-xs text-gray-500">Source: INCOIS • ITEWC Past 90 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Protect Coastal Communities?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join coastal communities and disaster management officials using SamudraSetu to enhance ocean hazard preparedness and response.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/website/auth/citizen"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Waves className="h-5 w-5 mr-2" />
              Report Ocean Hazards
            </Link>
            
            <Link
              href="/website/auth/admin"
              className="inline-flex items-center px-8 py-4 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Shield className="h-5 w-5 mr-2" />
              Disaster Management Access
            </Link>
            
            <Link
              href="/website/downloads"
              className="inline-flex items-center px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200 font-medium"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Mobile App
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
