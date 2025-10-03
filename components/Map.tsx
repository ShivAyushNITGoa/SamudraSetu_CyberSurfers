'use client'

import { useEffect, useRef } from 'react'

interface MapProps {
  center: { lat: number; lng: number }
  zoom?: number
  markers?: Array<{
    lat: number
    lng: number
    title?: string
    description?: string
    status?: 'pending' | 'in_progress' | 'resolved' | 'closed'
    [key: string]: any
  }>
  height?: string
  className?: string
  onMarkerClick?: (marker: any) => void
  showControls?: boolean
}

export default function Map({
  center,
  zoom = 15,
  markers = [],
  height = '400px',
  className = '',
  onMarkerClick,
  showControls = false
}: MapProps) {
  const containerRef = useRef(null as HTMLDivElement | null)
  const mapRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)
  const clusterGroupRef = useRef<any>(null)

  const getMarkerColor = (status?: string) => {
    switch (status) {
      case 'pending': return '#f59e0b' // amber-500
      case 'in_progress': return '#3b82f6' // blue-500
      case 'resolved': return '#10b981' // emerald-500
      case 'closed': return '#ef4444' // red-500
      default: return '#6b7280' // gray-500
    }
  }

  useEffect(() => {
    let isCancelled = false
    async function init() {
      const L = await import('leaflet')
      // Load default icon assets workaround for Leaflet with bundlers
      // @ts-ignore
      delete (L.Icon.Default as any).prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!containerRef.current || isCancelled) return
      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current).setView([center.lat, center.lng], zoom)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapRef.current)
      } else {
        mapRef.current.setView([center.lat, center.lng], zoom)
      }

      // Initialize cluster group lazily
      let MarkerCluster: any = null
      try {
        // @ts-ignore
        MarkerCluster = (L as any).markerClusterGroup ? {} : null
      } catch { MarkerCluster = null }
      if (!markersLayerRef.current) {
        markersLayerRef.current = L.layerGroup()
      } else {
        markersLayerRef.current.clearLayers()
      }
      if (MarkerCluster && !clusterGroupRef.current) {
        // @ts-ignore
        try {
          // @ts-ignore
          clusterGroupRef.current = (L as any).markerClusterGroup({ showCoverageOnHover: false })
          clusterGroupRef.current.addTo(mapRef.current)
        } catch {
          clusterGroupRef.current = null
        }
      }

      markers.forEach((m) => {
        const color = getMarkerColor(m.status)
        // Use circleMarker for easy color differentiation by status
        const marker = (L as any).circleMarker([m.lat, m.lng], {
          radius: 8,
          color,
          fillColor: color,
          fillOpacity: 0.9,
          weight: 2,
        })
        if (m.title || m.status || m.description) {
          const title = m.title ? `<strong>${m.title}</strong>` : ''
          const desc = m.description ? `<div>${m.description}</div>` : ''
          const status = m.status ? `<div>Status: ${m.status.replace('_', ' ')}</div>` : ''
          marker.bindPopup(`${title}${desc}${status}`)
        }
        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(m))
        }
        if (clusterGroupRef.current) {
          clusterGroupRef.current.addLayer(marker)
        } else {
          marker.addTo(markersLayerRef.current)
          if (!mapRef.current.hasLayer(markersLayerRef.current)) {
            markersLayerRef.current.addTo(mapRef.current)
          }
        }
      })
    }
    init()
    return () => { isCancelled = true }
  }, [center, zoom, markers, onMarkerClick])

  useEffect(() => {
    if (!mapRef.current || !showControls) return
    const L = (mapRef.current as any)
    // Leaflet already has zoom controls; ensure they are visible
    // Users can also scroll/drag by default
  }, [showControls])

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden border border-gray-200" />
    </div>
  )
}
