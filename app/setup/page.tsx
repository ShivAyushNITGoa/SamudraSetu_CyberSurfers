'use client'

import { useState } from 'react'
import { initializeAllServices } from '@/lib/initialize-services'

export default function SetupPage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [initializationStatus, setInitializationStatus] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)

  const handleInitialize = async () => {
    setIsInitializing(true)
    setInitializationStatus([])
    setIsComplete(false)

    try {
      const success = await initializeAllServices()
      
      if (success) {
        setInitializationStatus(prev => [...prev, '✅ All services initialized successfully!'])
        setIsComplete(true)
      } else {
        setInitializationStatus(prev => [...prev, '❌ Initialization failed. Check console for details.'])
      }
    } catch (error) {
      console.error('Setup error:', error)
      setInitializationStatus(prev => [...prev, `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`])
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">SamudraSetu Setup</h1>
          <p className="text-gray-400 text-lg">
            Initialize your comprehensive ocean hazard monitoring system
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Setup Checklist</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm">1</div>
              <div>
                <h3 className="font-semibold">Database Schema</h3>
                <p className="text-gray-400 text-sm">Execute the enhanced database schema in Supabase SQL Editor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm">2</div>
              <div>
                <h3 className="font-semibold">Environment Variables</h3>
                <p className="text-gray-400 text-sm">Configure your .env.local file with API keys</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm">3</div>
              <div>
                <h3 className="font-semibold">Service Initialization</h3>
                <p className="text-gray-400 text-sm">Initialize all monitoring services and configurations</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Service Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">🌊 Ocean Hazard Monitoring</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Real-time citizen reporting</li>
                <li>• GPS geotagging</li>
                <li>• Media upload support</li>
                <li>• Offline capability</li>
              </ul>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">📱 Social Media Monitoring</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Twitter API integration</li>
                <li>• YouTube monitoring</li>
                <li>• News RSS feeds</li>
                <li>• NLP processing</li>
              </ul>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">🏛️ Official Data Integration</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• INCOIS tsunami warnings</li>
                <li>• IMD cyclone alerts</li>
                <li>• NOAA sea level data</li>
                <li>• ESA marine monitoring</li>
              </ul>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">🚨 Alert System</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Threshold-based alerts</li>
                <li>• Multi-channel notifications</li>
                <li>• Role-based targeting</li>
                <li>• Escalation management</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Initialize Services</h2>
          
          <div className="text-center">
            <button
              onClick={handleInitialize}
              disabled={isInitializing}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
                isInitializing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : isComplete
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isInitializing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Initializing...</span>
                </div>
              ) : isComplete ? (
                '✅ Services Initialized'
              ) : (
                '🚀 Initialize Services'
              )}
            </button>
          </div>

          {initializationStatus.length > 0 && (
            <div className="mt-6 bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Initialization Log:</h3>
              <div className="space-y-1">
                {initializationStatus.map((status, index) => (
                  <div key={index} className="text-sm font-mono">
                    {status}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isComplete && (
            <div className="mt-6 bg-green-900 border border-green-700 rounded-lg p-4">
              <h3 className="font-semibold text-green-300 mb-2">🎉 Setup Complete!</h3>
              <p className="text-green-200 text-sm">
                Your SamudraSetu ocean hazard monitoring system is now ready. 
                You can access the dashboard and start monitoring ocean hazards.
              </p>
              <div className="mt-4">
                <a
                  href="/dashboard"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Go to Dashboard →
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>
            Need help? Check the <a href="/api-docs" className="text-blue-400 hover:underline">API Documentation</a> or 
            <a href="/architecture" className="text-blue-400 hover:underline ml-1">Architecture Guide</a>
          </p>
        </div>
      </div>
    </div>
  )
}
