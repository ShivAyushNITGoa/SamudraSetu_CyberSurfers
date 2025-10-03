import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Globe, 
  CheckCircle, 
  ArrowRight,
  Apple,
  Smartphone as Android,
  Monitor as Windows,
  Monitor as Linux,
  Globe as Chrome,
  Globe as Firefox,
  Globe as Safari,
  Globe as Edge,
  FileText,
  Shield,
  Zap,
  Users
} from 'lucide-react'

export default function DownloadsPage() {
  const mobileApps = [
    {
      platform: "iOS",
      icon: Apple,
      version: "2.1.0",
      size: "45.2 MB",
      requirements: "iOS 12.0 or later",
      features: ["iPhone", "iPad", "Apple Watch"],
      downloadUrl: "#",
      color: "blue",
      description: "Native iOS app with full feature set and Apple Watch support"
    },
    {
      platform: "Android",
      icon: Android,
      version: "2.1.0",
      size: "52.8 MB",
      requirements: "Android 7.0 (API level 24) or later",
      features: ["Phone", "Tablet", "Wear OS"],
      downloadUrl: "#",
      color: "green",
      description: "Native Android app with Material Design and Wear OS support"
    }
  ]

  const webApps = [
    {
      name: "SamudraSetu Admin Dashboard",
      description: "Verify hazards, monitor hotspots, and send alerts",
      url: "/website/auth/admin",
      icon: Shield,
      color: "blue",
      features: ["Verification", "Analytics", "Hotspots", "Reports"]
    },
    {
      name: "SamudraSetu Citizen Portal",
      description: "Report hazards with GPS and media; get alerts",
      url: "/website/auth/citizen",
      icon: Users,
      color: "green",
      features: ["Report", "Track", "Map", "Profile"]
    }
  ]

  const supportedBrowsers = [
    { name: "Chrome", icon: Chrome, version: "90+", color: "blue" },
    { name: "Firefox", icon: Firefox, version: "88+", color: "orange" },
    { name: "Safari", icon: Safari, version: "14+", color: "gray" },
    { name: "Edge", icon: Edge, version: "90+", color: "blue" }
  ]

  const systemRequirements = [
    {
      platform: "iOS",
      requirements: [
        "iOS 12.0 or later",
        "iPhone 6s or later",
        "iPad (5th generation) or later",
        "iPod touch (7th generation) or later",
        "At least 100 MB free storage"
      ]
    },
    {
      platform: "Android",
      requirements: [
        "Android 7.0 (API level 24) or later",
        "At least 2 GB RAM",
        "At least 100 MB free storage",
        "GPS and Camera support recommended",
        "Internet connection for full functionality"
      ]
    },
    {
      platform: "Web Browser",
      requirements: [
        "Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)",
        "JavaScript enabled",
        "Cookies enabled",
        "Internet connection",
        "Minimum 1024x768 screen resolution"
      ]
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
              <Download className="h-4 w-4 mr-2" />
              Downloads & Access
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Download <span className="gradient-text">SamudraSetu</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get SamudraSetu on your preferred platform. Available for mobile devices and web browsers.
            </p>
          </div>
        </div>
      </section>

      {/* Mobile Apps */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Mobile Applications
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Native mobile apps for iOS and Android with full offline capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mobileApps.map((app, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 bg-${app.color}-100 rounded-2xl flex items-center justify-center mr-4`}>
                    <app.icon className={`h-8 w-8 text-${app.color}-600`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{app.platform}</h3>
                    <p className="text-gray-600">Version {app.version}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">{app.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{app.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Requirements:</span>
                    <span className="font-medium">{app.requirements}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Supported Devices:</h4>
                  <div className="flex flex-wrap gap-2">
                    {app.features.map((feature, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 border">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Link
                  href={app.downloadUrl}
                  className="w-full inline-flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download for {app.platform}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Web Applications */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Web Applications
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Access SamudraSetu directly from your web browser - no installation required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {webApps.map((app, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 bg-${app.color}-100 rounded-2xl flex items-center justify-center mr-4`}>
                    <app.icon className={`h-8 w-8 text-${app.color}-600`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{app.name}</h3>
                    <p className="text-gray-600">Web Application</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">{app.description}</p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {app.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Link
                  href={app.url}
                  className="w-full inline-flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                >
                  <Globe className="h-5 w-5 mr-2" />
                  Access {app.name}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Browsers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Supported Browsers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              SamudraSetu works on all modern web browsers with the latest features.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {supportedBrowsers.map((browser, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-${browser.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <browser.icon className={`h-8 w-8 text-${browser.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{browser.name}</h3>
                <p className="text-sm text-gray-600">Version {browser.version}+</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              System Requirements
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Make sure your device meets the minimum requirements for optimal performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {systemRequirements.map((platform, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">{platform.platform}</h3>
                <ul className="space-y-3">
                  {platform.requirements.map((requirement, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Installation Guide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to get started with SamudraSetu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Download</h3>
              <p className="text-gray-600 text-sm">Download the app from App Store, Google Play, or access the web version</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Install</h3>
              <p className="text-gray-600 text-sm">Install the app on your device or bookmark the web version</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Using</h3>
              <p className="text-gray-600 text-sm">Create an account and start reporting issues in your community</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Choose your preferred platform and start making a difference in your community today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
              href="/website/auth/citizen"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Globe className="h-5 w-5 mr-2" />
              Use Web Version
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
