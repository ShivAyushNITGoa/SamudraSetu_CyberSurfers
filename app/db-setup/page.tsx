'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DatabaseSetupPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const checkDatabase = async () => {
    setLoading(true)
    setResults(null)
    
    try {
      // Test basic connection
      const { data: { user } } = await supabase.auth.getUser()
      
      // Check if profiles table exists
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      // Check if ocean_hazard_reports table exists
      const { data: reportsData, error: reportsError } = await supabase
        .from('ocean_hazard_reports')
        .select('count')
        .limit(1)

      // Try to create a test profile
      const testProfile = {
        id: 'test-' + Date.now(),
        email: 'test@example.com',
        name: 'Test User',
        role: 'citizen'
      }

      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert(testProfile)
        .select()

      // Clean up test data
      if (insertData) {
        await supabase
          .from('profiles')
          .delete()
          .eq('id', testProfile.id)
      }

      setResults({
        connection: 'Connected',
        tables: {
          profiles: { exists: !profilesError, error: profilesError?.message },
          ocean_hazard_reports: { exists: !reportsError, error: reportsError?.message }
        },
        profileInsert: {
          success: !insertError,
          error: insertError?.message,
          details: insertError?.details,
          hint: insertError?.hint,
          code: insertError?.code
        },
        environment: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
        }
      })
    } catch (error: any) {
      setResults({
        connection: 'Failed',
        error: error.message,
        environment: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Setup Check</h1>
        
        <div className="space-y-4">
          <button
            onClick={checkDatabase}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Database Setup'}
          </button>
        </div>

        {results && (
          <div className="mt-8 space-y-6">
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Connection Status</h2>
              <p className={`text-lg ${results.connection === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                {results.connection}
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
              <ul className="space-y-2">
                <li>Supabase URL: <span className={results.environment.supabaseUrl === 'Set' ? 'text-green-600' : 'text-red-600'}>{results.environment.supabaseUrl}</span></li>
                <li>Anon Key: <span className={results.environment.anonKey === 'Set' ? 'text-green-600' : 'text-red-600'}>{results.environment.anonKey}</span></li>
              </ul>
            </div>

            {results.tables && (
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Table Status</h2>
                <ul className="space-y-2">
                  <li>
                    profiles: <span className={results.tables.profiles.exists ? 'text-green-600' : 'text-red-600'}>
                      {results.tables.profiles.exists ? 'Exists' : 'Missing'}
                    </span>
                    {results.tables.profiles.error && (
                      <div className="text-sm text-red-500 mt-1">Error: {results.tables.profiles.error}</div>
                    )}
                  </li>
                  <li>
                    ocean_hazard_reports: <span className={results.tables.ocean_hazard_reports.exists ? 'text-green-600' : 'text-red-600'}>
                      {results.tables.ocean_hazard_reports.exists ? 'Exists' : 'Missing'}
                    </span>
                    {results.tables.ocean_hazard_reports.error && (
                      <div className="text-sm text-red-500 mt-1">Error: {results.tables.ocean_hazard_reports.error}</div>
                    )}
                  </li>
                </ul>
              </div>
            )}

            {results.profileInsert && (
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Profile Insert Test</h2>
                <p className={results.profileInsert.success ? 'text-green-600' : 'text-red-600'}>
                  {results.profileInsert.success ? 'Success' : 'Failed'}
                </p>
                {results.profileInsert.error && (
                  <div className="mt-2 text-sm">
                    <p><strong>Error:</strong> {results.profileInsert.error}</p>
                    {results.profileInsert.details && <p><strong>Details:</strong> {results.profileInsert.details}</p>}
                    {results.profileInsert.hint && <p><strong>Hint:</strong> {results.profileInsert.hint}</p>}
                    {results.profileInsert.code && <p><strong>Code:</strong> {results.profileInsert.code}</p>}
                  </div>
                )}
              </div>
            )}

            {results.error && (
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-xl font-bold mb-4 text-red-800">Error</h2>
                <p className="text-red-700">{results.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Database Setup Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to your Supabase project dashboard</li>
            <li>Navigate to the SQL Editor</li>
            <li>Copy and paste the contents of <code>scripts/reset-database-exact.sql</code></li>
            <li>Run the SQL script to create all tables and policies</li>
            <li>Make sure PostGIS extension is enabled in your Supabase project</li>
            <li>Run this check again to verify setup</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
