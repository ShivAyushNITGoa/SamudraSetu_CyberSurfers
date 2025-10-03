'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { testDatabaseConnection, getAllReports, createSampleData } from '@/lib/queries'
import { Database, AlertCircle, CheckCircle } from 'lucide-react'

export default function DatabaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    setLoading(true)
    try {
      // Test basic connection
      const isConnected = await testDatabaseConnection()
      
      // Test tables exist
      const { data: reportsData, error: reportsError } = await supabase
        .from('ocean_hazard_reports')
        .select('count')
        .limit(1)
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      const { data: commentsData, error: commentsError } = await supabase
        .from('report_comments')
        .select('count')
        .limit(1)

      const { data: socialData, error: socialError } = await supabase
        .from('social_media_feeds')
        .select('count')
        .limit(1)

      // Get actual data
      const reports = await getAllReports()

      setDebugInfo({
        connection: isConnected,
        tables: {
          ocean_hazard_reports: { exists: !reportsError, error: reportsError?.message },
          profiles: { exists: !profilesError, error: profilesError?.message },
          report_comments: { exists: !commentsError, error: commentsError?.message },
          social_media_feeds: { exists: !socialError, error: socialError?.message }
        },
        data: {
          reportsCount: reports.length,
          sampleReport: reports[0] || null
        },
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      })
    } catch (error) {
      setDebugInfo({
        error: (error as Error).message,
        connection: false
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <Database className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">Database Debug</h3>
      </div>
      
      <div className="flex space-x-3 mb-4">
        <button
          onClick={runDebug}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Testing...' : 'Test Database Connection'}
        </button>
        <button
          onClick={async () => {
            setLoading(true)
            try {
              const success = await createSampleData()
              if (success) {
                alert('Sample data created successfully!')
                runDebug() // Refresh the debug info
              } else {
                alert('Failed to create sample data')
              }
            } catch (error) {
              alert('Error creating sample data: ' + (error as Error).message)
            } finally {
              setLoading(false)
            }
          }}
          disabled={loading}
          className="btn btn-secondary"
        >
          Create Sample Data
        </button>
      </div>

      {debugInfo && (
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center">
            {debugInfo.connection ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span className={`font-medium ${debugInfo.connection ? 'text-green-700' : 'text-red-700'}`}>
              Database Connection: {debugInfo.connection ? 'Success' : 'Failed'}
            </span>
          </div>

          {/* Environment Variables */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Environment Variables:</h4>
            <div className="text-sm space-y-1">
              <div>Supabase URL: {debugInfo.supabaseUrl ? '✅ Set' : '❌ Missing'}</div>
              <div>Anon Key: {debugInfo.hasAnonKey ? '✅ Set' : '❌ Missing'}</div>
            </div>
          </div>

          {/* Tables Status */}
          {debugInfo.tables && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tables Status:</h4>
              <div className="text-sm space-y-1">
                {Object.entries(debugInfo.tables).map(([table, info]: [string, any]) => (
                  <div key={table} className="flex items-center">
                    {info.exists ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span>{table}: {info.exists ? '✅ Exists' : `❌ Error: ${info.error}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Status */}
          {debugInfo.data && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data Status:</h4>
              <div className="text-sm space-y-1">
                <div>Ocean Hazard Reports Count: {debugInfo.data.reportsCount}</div>
                {debugInfo.data.sampleReport && (
                  <div>
                    <div>Sample Report:</div>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(debugInfo.data.sampleReport, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {debugInfo.error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <h4 className="font-medium text-red-800 mb-1">Error:</h4>
              <p className="text-sm text-red-700">{debugInfo.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
