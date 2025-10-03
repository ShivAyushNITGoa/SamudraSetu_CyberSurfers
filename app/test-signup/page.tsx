'use client'

import { useState } from 'react'
import { signUp } from '@/lib/auth'

export default function TestSignupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const testSignup = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      const testEmail = `test-${Date.now()}@gmail.com`
      const { user, error } = await signUp(
        testEmail,
        'testpassword123',
        'Test User',
        { phone: '1234567890' }
      )
      
      if (error) {
        setError(`Signup error: ${error.message}`)
      } else if (user) {
        setResult({ 
          success: true, 
          user: { 
            id: user.id, 
            email: user.email,
            email_confirmed_at: user.email_confirmed_at
          } 
        })
      }
    } catch (err: any) {
      setError(`Exception: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testProfileAPI = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      const testUserId = 'test-user-id-' + Date.now()
      const response = await fetch('/api/profiles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: testUserId,
          email: `test-${Date.now()}@gmail.com`,
          name: 'Test User',
          role: 'citizen'
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(`API error: ${data.error}`)
      } else {
        setResult({ success: true, profile: data.profile })
      }
    } catch (err: any) {
      setError(`Exception: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Signup Test Page</h1>
        
        <div className="space-y-4">
          <button
            onClick={testSignup}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Supabase Signup'}
          </button>
          
          <button
            onClick={testProfileAPI}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 ml-4"
          >
            {loading ? 'Testing...' : 'Test Profile API'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h3 className="font-bold">Error:</h3>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <h3 className="font-bold">Success:</h3>
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-200 rounded">
          <h3 className="font-bold mb-2">Environment Check:</h3>
          <ul className="text-sm">
            <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</li>
            <li>SUPABASE_SERVICE_ROLE_KEY: {process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
