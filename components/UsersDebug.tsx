'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function UsersDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // Test 1: Basic connection
      console.log('Test 1: Testing basic Supabase connection...')
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      results.basicConnection = {
        success: !testError,
        error: testError?.message,
        data: testData
      }

      // Test 2: Simple select without ordering
      console.log('Test 2: Testing simple select without ordering...')
      const { data: simpleData, error: simpleError } = await supabase
        .from('profiles')
        .select('id, email, name, role')
      
      results.simpleSelect = {
        success: !simpleError,
        error: simpleError?.message,
        count: simpleData?.length || 0,
        data: simpleData?.slice(0, 2) // Show first 2 records
      }

      // Test 3: Select with ordering
      console.log('Test 3: Testing select with ordering...')
      const { data: orderedData, error: orderedError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      results.orderedSelect = {
        success: !orderedError,
        error: orderedError?.message,
        count: orderedData?.length || 0,
        data: orderedData?.slice(0, 2) // Show first 2 records
      }

      // Test 4: Check if profiles table exists
      console.log('Test 4: Checking if profiles table exists...')
      const { data: tableData, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'profiles')
        .eq('table_schema', 'public')
      
      results.tableExists = {
        success: !tableError,
        error: tableError?.message,
        exists: (tableData?.length || 0) > 0
      }

      // Test 5: Check RLS policies
      console.log('Test 5: Checking RLS policies...')
      const { data: policyData, error: policyError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'profiles')
      
      results.rlsPolicies = {
        success: !policyError,
        error: policyError?.message,
        policies: policyData?.length || 0,
        data: policyData
      }

      // Test 6: Check current user
      console.log('Test 6: Checking current user...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      results.currentUser = {
        success: !userError,
        error: userError?.message,
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role
        } : null
      }

    } catch (error) {
      results.generalError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error
      }
    }

    setDebugInfo(results)
    setLoading(false)
  }

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🔍 Users Page Diagnostics</h3>
      
      <button
        onClick={runDiagnostics}
        disabled={loading}
        className="btn btn-primary mb-4"
      >
        {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
      </button>

      {Object.keys(debugInfo).length > 0 && (
        <div className="space-y-4">
          {Object.entries(debugInfo).map(([testName, result]: [string, any]) => (
            <div key={testName} className="bg-white p-4 rounded border">
              <h4 className="font-semibold text-sm mb-2">
                {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h4>
              <div className="text-xs space-y-1">
                <div className={`font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {result.success ? '✅ Success' : '❌ Failed'}
                </div>
                {result.error && (
                  <div className="text-red-600">
                    Error: {result.error}
                  </div>
                )}
                {result.count !== undefined && (
                  <div className="text-blue-600">
                    Count: {result.count}
                  </div>
                )}
                {result.data && (
                  <div className="text-gray-600">
                    <details>
                      <summary className="cursor-pointer">Data (click to expand)</summary>
                      <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
