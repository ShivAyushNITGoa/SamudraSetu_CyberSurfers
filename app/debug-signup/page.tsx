'use client'

import { useState } from 'react'
// import { signUp } from '@/lib/auth' // Using server-side signup now

export default function DebugSignupPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const testSignup = async () => {
    setLoading(true)
    setResults(null)
    
    try {
      const testEmail = `debug-${Date.now()}@gmail.com`
      console.log('Starting server-side signup test with email:', testEmail)
      
      // Use server-side signup endpoint
      const response = await fetch('/api/auth/signup-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'testpassword123',
          name: 'Debug Test User',
          phone: '1234567890',
          role: 'citizen'
        })
      })
      
      const data = await response.json()
      console.log('Server signup result:', data)
      
      if (!response.ok) {
        setResults({ 
          success: false, 
          error: data.error,
          details: data,
          step: 'server_signup'
        })
      } else {
        setResults({ 
          success: true, 
          user: data.user,
          profile: data.profile,
          step: 'complete'
        })
      }
    } catch (err: any) {
      console.error('Signup test error:', err)
      setResults({ 
        success: false, 
        error: err.message,
        details: err,
        step: 'exception'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Signup Flow</h1>
        
        <div className="space-y-4">
          <button
            onClick={testSignup}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing Signup...' : 'Test Complete Signup Flow'}
          </button>
        </div>

        {results && (
          <div className="mt-8 space-y-6">
            <div className={`p-6 rounded-lg shadow ${results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h2 className={`text-xl font-bold mb-4 ${results.success ? 'text-green-800' : 'text-red-800'}`}>
                {results.success ? '✅ Success' : '❌ Failed'}
              </h2>
              
              <div className="space-y-2">
                <p><strong>Step:</strong> {results.step}</p>
                {results.error && <p><strong>Error:</strong> {results.error}</p>}
                {results.userCreated && <p><strong>User Created:</strong> Yes (ID: {results.userId})</p>}
              </div>
            </div>

            {results.user && (
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-bold mb-2">User Created</h3>
                <pre className="text-sm bg-white p-3 rounded border overflow-auto">
                  {JSON.stringify(results.user, null, 2)}
                </pre>
              </div>
            )}

            {results.profile && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-bold mb-2">Profile Created</h3>
                <pre className="text-sm bg-white p-3 rounded border overflow-auto">
                  {JSON.stringify(results.profile, null, 2)}
                </pre>
              </div>
            )}

            {results.details && (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-bold mb-2">Full Details</h3>
                <pre className="text-sm bg-white p-3 rounded border overflow-auto">
                  {JSON.stringify(results.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check browser console for detailed logs</li>
            <li>Verify database tables exist in Supabase</li>
            <li>Check RLS policies are properly set up</li>
            <li>Ensure PostGIS extension is enabled</li>
            <li>Verify service role key has proper permissions</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
