import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import { 
  Smartphone, 
  Download, 
  MapPin, 
  Camera, 
  Bell, 
  Wifi, 
  WifiOff,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  BarChart3,
  MessageSquare,
  Share2,
  Settings,
  Shield,
  Zap,
  Globe
} from 'lucide-react'

export default function MobileAppPage() {
  const features = [
    {
      title: "Offline Capabilities",
      description: "Report issues even without internet connection",
      icon: WifiOff,
      details: [
        "Draft issues offline",
        "Sync when connected",
        "Cached data access",
        "Background sync"
      ]
    },
    {
      title: "Push Notifications",
      description: "Get instant updates on your reported issues",
      icon: Bell,
      details: [
        "Status change alerts",
        "Resolution notifications",
        "Community updates",
        "Customizable preferences"
      ]
    },
    {
      title: "GPS Integration",
      description: "Automatic location detection for accurate reporting",
      icon: MapPin,
      details: [
        "Auto-location detection",
        "Manual location picker",
        "Location history",
        "Nearby issues view"
      ]
    },
    {
      title: "Camera Integration",
      description: "Take photos and videos directly in the app",
      icon: Camera,
      details: [
        "High-quality photos",
        "Video recording",
        "Image compression",
        "Multiple media support"
      ]
    }
  ]

  const platforms = [
    {
      name: "iOS",
      icon: "🍎",
      version: "iOS 12.0+",
      features: ["iPhone", "iPad", "Apple Watch"],
      download: "App Store"
    },
    {
      name: "Android",
      icon: "🤖",
      version: "Android 7.0+",
      features: ["Phone", "Tablet", "Wear OS"],
      download: "Google Play"
    },
    {
      name: "Web",
      icon: "🌐",
      version: "All Browsers",
      features: ["PWA Support", "Responsive", "Cross-platform"],
      download: "Browser"
    }
  ]

  const appScreens = [
    { title: "Home Dashboard", description: "Overview of all your issues and community activity" },
    { title: "Report Issue", description: "Quick and easy issue reporting with photos and location" },
    { title: "Issue Tracking", description: "Real-time progress tracking for all your reports" },
    { title: "Community Map", description: "Interactive map showing all issues in your area" },
    { title: "Profile & Settings", description: "Manage your profile and notification preferences" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-8">
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile Application
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              SamudraSetu <span className="gradient-text">Mobile App</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Report coastal hazards with GPS, photos/videos, and offline queueing. Get alerts and track verification status, in multiple Indian languages.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/website/downloads"
                className="inline-flex items-center px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              
              <Link
                href="/website/how-it-works"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200"
              >
                <Globe className="h-5 w-5 mr-2" />
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
              Beautiful & Intuitive Design
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with Flutter for iOS and Android. Offline cache (SQLite/Hive), secure Supabase Auth, and background sync.
            </p>
          </div>

          {/* Mobile Mockups */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {appScreens.slice(0, 3).map((screen, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-900 rounded-3xl p-4 shadow-2xl mx-auto max-w-xs">
                  <div className="bg-white rounded-2xl p-6">
                    <div className="h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <Smartphone className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-sm text-gray-600">{screen.title}</p>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{screen.title}</h3>
                    <p className="text-sm text-gray-600">{screen.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Mobile-First Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Features designed for rapid, reliable ocean hazard reporting in the field.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-purple-600" />
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

      {/* Platform Support */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Available on All Platforms
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Download SamudraSetu on your preferred platform and device.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {platforms.map((platform, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="text-6xl mb-4">{platform.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{platform.name}</h3>
                <p className="text-gray-600 mb-4">{platform.version}</p>
                
                <div className="space-y-2 mb-6">
                  {platform.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/website/downloads"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {platform.download}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose the Mobile App?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the full power of SamudraSetu wherever you are.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Performance</h3>
              <p className="text-gray-600 text-sm">Optimized for speed and smooth user experience</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">End-to-end encryption and privacy protection</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Features</h3>
              <p className="text-gray-600 text-sm">Connect with your community and neighbors</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Analytics</h3>
              <p className="text-gray-600 text-sm">Track your civic engagement and impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Screenshots */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              App Screenshots
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get a preview of the beautiful and functional interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {appScreens.map((screen, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-900 rounded-2xl p-3 shadow-lg mx-auto max-w-xs">
                  <div className="bg-white rounded-xl p-4">
                    <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <Smartphone className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-xs text-gray-600">{screen.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mt-3 mb-1">{screen.title}</h3>
                <p className="text-sm text-gray-600">{screen.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Download SamudraSetu Mobile App
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already making a difference in their communities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/website/downloads"
              className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Download className="h-5 w-5 mr-2" />
              Download for iOS
            </Link>
            
            <Link
              href="/website/downloads"
              className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Download className="h-5 w-5 mr-2" />
              Download for Android
            </Link>
            
            <Link
              href="/website/auth/citizen"
              className="inline-flex items-center px-8 py-4 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Globe className="h-5 w-5 mr-2" />
              Use Web Version
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
