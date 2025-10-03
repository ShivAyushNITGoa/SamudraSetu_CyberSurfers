import Link from 'next/link'
import { Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <span className="text-xl font-bold">SamudraSetu</span>
            </div>
            <p className="text-gray-400 text-sm">
              Integrated ocean hazard reporting and analytics platform connecting citizens and disaster management.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="GitHub" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/website/how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/website/admin-app" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link href="/website/citizen-app" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Citizen Portal
                </Link>
              </li>
              <li>
                <Link href="/website/mobile-app" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Mobile App
                </Link>
              </li>
              <li>
                <Link href="/website/downloads" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Downloads
                </Link>
              </li>
            </ul>
          </div>

          {/* Apps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Applications</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/website/auth/admin" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Admin Login
                </Link>
              </li>
              <li>
                <Link href="/website/auth/citizen" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Citizen Portal
                </Link>
              </li>
              <li>
                <Link href="/website/downloads" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Download Mobile App
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 text-sm">contact@thegdevelopers.online</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 text-sm">India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 SamudraSetu. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/website/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/website/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
