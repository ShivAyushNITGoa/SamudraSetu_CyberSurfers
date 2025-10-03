'use client'

import React from 'react'

interface SkeletonCardProps {
  className?: string
}

export default function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 animate-pulse ${className}`}>
      <div className="flex items-start space-x-4">
        {/* Avatar skeleton */}
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
        
        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          {/* Title skeleton */}
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
          
          {/* Meta info skeleton */}
          <div className="flex items-center space-x-4">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
          
          {/* Status and priority badges skeleton */}
          <div className="flex items-center space-x-2">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-12"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton for stats cards
export function SkeletonStatsCard() {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 animate-pulse">
      <div className="flex items-center">
        <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
        <div className="ml-3 space-y-1">
          <div className="h-6 bg-gray-200 rounded w-8"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}

// Skeleton for the entire page
export function CitizenPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header skeleton */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
            </div>
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonStatsCard key={i} />
            ))}
          </div>

          {/* Search bar skeleton */}
          <div className="h-12 bg-gray-200 rounded-xl mb-4"></div>

          {/* Status tabs skeleton */}
          <div className="flex space-x-1 bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Issues list skeleton */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20 pt-6">
        <div className="grid gap-4 sm:gap-6">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

