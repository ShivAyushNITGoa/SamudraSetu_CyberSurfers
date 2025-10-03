'use client'

import dynamic from 'next/dynamic'
// Dynamically import Leaflet map to avoid SSR (window is not defined)
const OpenStreetMap = dynamic(() => import('./OpenStreetMap'), { ssr: false })

interface OceanHazardReport {
  id: string
  title: string
  description: string
  hazard_type: string
  severity: string
  status: string
  location: {
    latitude: number
    longitude: number
  }
  created_at: string
  confidence_score: number
  social_media_indicators: {
    tweet_count?: number
    sentiment_score?: number
    trending_keywords?: string[]
  }
}

interface OceanHazardMapProps {
  reports: OceanHazardReport[]
  viewMode: 'markers' | 'heatmap' | 'clusters'
  onReportClick?: (report: OceanHazardReport) => void
}

export default function OceanHazardMap({ reports, viewMode, onReportClick }: OceanHazardMapProps) {
  return (
    <OpenStreetMap
      reports={reports}
      viewMode={viewMode}
      onReportClick={onReportClick}
      className="h-full w-full"
    />
  )
}
