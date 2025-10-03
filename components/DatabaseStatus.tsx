'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function DatabaseStatus() {
  const [status, setStatus] = useState<{
    connected: boolean
    tables: Record<string, boolean>
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    setLoading(true)
    try {
      console.log('🔍 Checking database status...')
      
      // Test basic connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('ocean_hazard_reports')
        .select('count')
        .limit(1)
      
      if (connectionError) {
        console.error('❌ Connection test failed:', connectionError)
        setStatus({
          connected: false,
          tables: {},
          error: connectionError.message
        })
        return
      }

      // Test individual tables
      const tables = ['ocean_hazard_reports', 'profiles', 'report_comments']
      const tableStatus: Record<string, boolean> = {}
      
      for (const table of tables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('count')
            .limit(1)
          
          tableStatus[table] = !error
          if (error) {
            console.error(`❌ Table ${table} test failed:`, error)
          } else {
            console.log(`✅ Table ${table} accessible`)
          }
        } catch (error) {
          console.error(`❌ Table ${table} error:`, error)
          tableStatus[table] = false
        }
      }

      setStatus({
        connected: true,
        tables: tableStatus
      })
      
    } catch (error) {
      console.error('❌ Database status check failed:', error)
      setStatus({
        connected: false,
        tables: {},
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm text-gray-600">Checking database status...</span>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="p-4 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <XCircle className="h-4 w-4 text-red-600 mr-2" />
          <span className="text-sm text-red-600">Failed to check database status</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="flex items-center mb-3">
        {status.connected ? (
          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600 mr-2" />
        )}
        <span className="text-sm font-medium">
          Database: {status.connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      {status.error && (
        <div className="mb-3 p-2 bg-red-100 rounded text-xs text-red-700">
          Error: {status.error}
        </div>
      )}
      
      <div className="space-y-1">
        {Object.entries(status.tables).map(([table, accessible]) => (
          <div key={table} className="flex items-center text-xs">
            {accessible ? (
              <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
            ) : (
              <XCircle className="h-3 w-3 text-red-600 mr-2" />
            )}
            <span className={accessible ? 'text-green-700' : 'text-red-700'}>
              {table}
            </span>
          </div>
        ))}
      </div>
      
      <button
        onClick={checkDatabaseStatus}
        className="mt-3 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
      >
        Refresh
      </button>
    </div>
  )
}
