'use client'

import { memo } from 'react'

const WebsiteLoadingSpinner = memo(function WebsiteLoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
          <span className="text-white font-bold text-xl">NS</span>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">SamudraSetu</h2>
        <p className="text-gray-600">Loading your civic management platform...</p>
      </div>
    </div>
  )
})

export default WebsiteLoadingSpinner
