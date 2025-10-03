import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import { 
  Globe, 
  MapPin, 
  Camera, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Eye,
  Plus,
  Filter,
  Search,
  Star,
  Users,
  BarChart3,
  Bell,
  Share2
} from 'lucide-react'
import dynamic from 'next/dynamic'
const OceanHazardMap = dynamic(() => import('../../../components/OceanHazardMap'), { ssr: false })

export default function CitizenAppPage() {
  const features = [
    {
      title: "Easy Issue Reporting",
      description: "Report civic issues quickly with photos, location, and detailed descriptions",
      icon: Plus,
      details: [
        "Take photos of issues",
        "GPS location detection",
        "Category selection",
        "Priority setting"
      ]
    },
    {
      title: "Real-time Tracking",
      description: "Track the progress of your reported issues in real-time",
      icon: Clock,
      details: [
        "Status updates",
        "Progress notifications",
        "Estimated resolution time",
        "Department assignment"
      ]
    },
    {
      title: "Community Engagement",
      description: "Engage with your community through comments and voting",
      icon: Users,
      details: [
        "Comment on issues",
        "Vote on priority",
        "Share with others",
        "Follow updates"
      ]
    },
    {
      title: "Interactive Map",
      description: "View all issues in your area on an interactive map",
      icon: MapPin,
      details: [
        "Location-based view",
        "Issue clustering",
        "Filter by category",
        "Distance calculation"
      ]
    }
  ]

  const issueTypes = [
    { name: "Tides & Waves", icon: MapPin, color: "blue", examples: ["Unusual tide", "High wave", "Sneaker wave"] },
    { name: "Coastal Flooding", icon: Globe, color: "green", examples: ["Sea water ingress", "Storm surge", "Standing water"] },
    { name: "Erosion & Damage", icon: AlertTriangle, color: "red", examples: ["Beach erosion", "Seawall damage", "Debris"] },
    { name: "Marine Hazards", icon: Users, color: "purple", examples: ["Strong currents", "Rip current", "Hazardous spill"] },
    { name: "Other Observations", icon: CheckCircle, color: "orange", examples: ["Unusual smell", "Wildlife stranding", "Other"] }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-8">
              <Globe className="h-4 w-4 mr-2" />
              Citizen Portal
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              SamudraSetu <span className="gradient-text">Citizen Portal</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Report ocean hazards with GPS and media, get alerts, and track verification status. Simple, fast, multilingual, and offline-capable.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/website/auth/citizen"
                className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Globe className="h-5 w-5 mr-2" />
                Access Citizen Portal
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              
              <Link
                href="/website/how-it-works"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200"
              >
                <Eye className="h-5 w-5 mr-2" />
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple & Intuitive Interface
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed for everyone - no technical knowledge required.
            </p>
          </div>

          {/* Mobile Preview + Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-gray-900 rounded-3xl p-4 shadow-2xl max-w-md mx-auto w-full">
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Report Ocean Hazard</h3>
                  <button
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    aria-label="Add new issue"
                    title="Add new issue"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Camera className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Add Photo</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Hazard title (e.g., Unusual tide)" 
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                    />
                    <textarea 
                      placeholder="Describe what you observed..." 
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm h-20 resize-none"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 p-3 bg-green-600 text-white rounded-lg text-sm font-medium">
                      Submit Report
                    </button>
                    <button
                      className="p-3 border border-gray-300 rounded-lg"
                      aria-label="Set location"
                      title="Set location"
                    >
                      <MapPin className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[420px] rounded-2xl overflow-hidden border border-gray-200">
              <OceanHazardMap
                reports={[
                  { id: 'c1', title: 'High waves observed', description: 'Waves crossing promenade', hazard_type: 'unusual_tides', severity: 'high', status: 'unverified', location: { latitude: 19.08, longitude: 72.88 }, created_at: new Date().toISOString(), confidence_score: 0.7, social_media_indicators: { tweet_count: 18 } }
                ] as any}
                viewMode="markers"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to engage with your community and report issues effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Issue Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Report Any Type of Issue
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From infrastructure problems to environmental concerns, report what matters to your community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issueTypes.map((type, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 bg-${type.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                  <type.icon className={`h-6 w-6 text-${type.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{type.name}</h3>
                <ul className="space-y-1">
                  {type.examples.map((example, idx) => (
                    <li key={idx} className="text-sm text-gray-600">
                      • {example}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Experience */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Designed for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              User-friendly design that works for all ages and technical skill levels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Reporting</h3>
              <p className="text-gray-600 text-sm">Simple 3-step process to report any issue</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Updates</h3>
              <p className="text-gray-600 text-sm">Get notified immediately when status changes</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Share & Engage</h3>
              <p className="text-gray-600 text-sm">Share issues with neighbors and community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Your Personal Dashboard
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your reports and alerts in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Issue Statistics</h3>
                  <p className="text-gray-600">View your reporting history and resolution rates</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h3>
                  <p className="text-gray-600">Real-time updates on all your reported issues</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Interaction</h3>
                  <p className="text-gray-600">Engage with comments and community discussions</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Issues</h3>
                <div className="space-y-3">
                  {[
                    { title: "High wave at beach", status: "In Progress", time: "2 days ago" },
                    { title: "Flooding near jetty", status: "Resolved", time: "1 week ago" },
                    { title: "Coastal erosion", status: "Pending", time: "3 days ago" }
                  ].map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{issue.title}</h4>
                        <p className="text-xs text-gray-500">{issue.time}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {issue.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Start Reporting Hazards
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join coastal volunteers using SamudraSetu to improve safety.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/website/auth/citizen"
              className="inline-flex items-center px-8 py-4 bg-white text-green-600 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Globe className="h-5 w-5 mr-2" />
              Access Citizen Portal
            </Link>
            
            <Link
              href="/website/mobile-app"
              className="inline-flex items-center px-8 py-4 bg-green-700 text-white rounded-xl hover:bg-green-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Download Mobile App
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
