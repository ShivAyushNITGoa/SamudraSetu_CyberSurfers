import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import '@/styles/map.css'
import AuthProvider from '@/components/AuthProvider'
import { Toaster } from 'react-hot-toast'
// ToastProvider moved to client component in components/ToastProvider

export const metadata: Metadata = {
  title: 'SamudraSetu - Smart Civic Issues Management Platform',
  description: 'SamudraSetu is a comprehensive platform for managing civic issues and citizen engagement with AI-powered categorization, real-time analytics, and mobile support',
  keywords: ['SamudraSetu', 'civic issues', 'government', 'citizen engagement', 'public services', 'municipal management'],
  authors: [{ name: 'SamudraSetu Team' }],
  creator: 'SamudraSetu Platform',
  publisher: 'Government Digital Services',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://civic-issues.gov'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Civic Issues Management System',
    description: 'A comprehensive platform for managing civic issues and citizen engagement',
    url: 'https://civic-issues.gov',
    siteName: 'Civic Issues Management',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Civic Issues Management System',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Civic Issues Management System',
    description: 'A comprehensive platform for managing civic issues and citizen engagement',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    title: 'Civic Issues',
    statusBarStyle: 'default',
    capable: true,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}