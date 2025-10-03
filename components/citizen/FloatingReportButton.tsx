'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function FloatingReportButton() {
  return (
    <Link
      href="/citizen/report"
      className="fixed bottom-24 right-4 sm:right-6 z-20 inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
      aria-label="Report Issue"
    >
      <Plus className="h-6 w-6" />
    </Link>
  )
}


