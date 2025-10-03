'use client'

import { useEffect, useRef, useState } from 'react'

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

interface OpenStreetMapProps {
  reports: OceanHazardReport[]
  viewMode: 'markers' | 'heatmap' | 'clusters'
  onReportClick?: (report: OceanHazardReport) => void
  className?: string
}

export default function OpenStreetMap({ reports, viewMode, onReportClick, className = '' }: OpenStreetMapProps) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])
  const heatmapLayerRef = useRef<any>(null)
  const clusterLayerRef = useRef<any>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const leafletRef = useRef<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasMapInitialized, setHasMapInitialized] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  const getHazardColor = (hazardType: string) => {
    const colors: Record<string, string> = {
      tsunami: '#ef4444',
      storm_surge: '#f97316',
      flooding: '#3b82f6',
      erosion: '#84cc16',
      unusual_tides: '#06b6d4',
      coastal_damage: '#8b5cf6',
      marine_pollution: '#10b981',
      weather_anomaly: '#f59e0b',
      cyclone: '#dc2626',
      storm_track: '#ea580c',
      sea_level_rise: '#0284c7',
      coral_bleaching: '#059669',
      oil_spill: '#7c2d12',
      algal_bloom: '#16a34a',
      hotspot: '#a855f7',
      other: '#6b7280'
    }
    return colors[hazardType] || colors.other
  }

  const getMarkerSize = (severity: string) => {
    const sizes: Record<string, number> = {
      low: 12,
      medium: 16,
      high: 20,
      critical: 24
    }
    return sizes[severity] || sizes.medium
  }

  const createCustomIcon = (hazardType: string, severity: string) => {
    const color = getHazardColor(hazardType)
    const size = getMarkerSize(severity)
    const L = leafletRef.current
    if (!L) return undefined as any
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${size * 0.4}px;
          color: white;
          font-weight: bold;
        ">
          ${hazardType.charAt(0).toUpperCase()}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    })
  }

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      }, { root: null, threshold: 0.1 })
      observer.observe(mapContainerRef.current)
      return () => observer.disconnect()
    } else {
      setIsVisible(true)
    }
  }, [])

  useEffect(() => {
    if (!isVisible || !mapContainerRef.current || mapRef.current) return

    let mounted = true

    ;(async () => {
      try {
        const L = await import('leaflet')
        
        if (!mounted) return
        
        leafletRef.current = L
        
        // @ts-ignore
        delete ((L as any).Icon.Default.prototype as any)._getIconUrl
        ;(L as any).Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        if (!mapContainerRef.current) return

        mapRef.current = (L as any).map(mapContainerRef.current, {
          center: [12.9716, 77.5946],
          zoom: 6,
          zoomControl: true,
          attributionControl: true,
          preferCanvas: true
        })

        const light = (L as any).tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        })
        light.addTo(mapRef.current)

        const satelliteLayer = (L as any).tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri',
          maxZoom: 19
        })

        const terrainLayer = (L as any).tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenTopoMap contributors',
          maxZoom: 17
        })

        const darkLayer = (L as any).tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors © CARTO',
          maxZoom: 19
        })

        const baseMaps = {
          'Satellite': satelliteLayer,
          'Terrain': terrainLayer,
          'Dark': darkLayer
        }

        ;(L as any).control.layers(baseMaps).addTo(mapRef.current)

        // Force map to recognize container size
        setTimeout(() => {
          if (mapRef.current && mounted) {
            mapRef.current.invalidateSize()
          }
        }, 100)

        // Additional resize after a longer delay to ensure container is fully rendered
        setTimeout(() => {
          if (mapRef.current && mounted) {
            mapRef.current.invalidateSize()
          }
        }, 500)

        setHasMapInitialized(true)

        // Resize observer to avoid layout thrash on container resize
        if ('ResizeObserver' in window) {
          resizeObserverRef.current = new ResizeObserver(() => {
            if (mapRef.current) mapRef.current.invalidateSize()
          })
          if (mapContainerRef.current) resizeObserverRef.current.observe(mapContainerRef.current)
        }

      } catch (error) {
        console.error('Error initializing map:', error)
        setMapError('Failed to initialize map. Please refresh the page.')
      }
    })()

    return () => {
      mounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      if (resizeObserverRef.current && mapContainerRef.current) {
        resizeObserverRef.current.unobserve(mapContainerRef.current)
        resizeObserverRef.current = null
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!mapRef.current || !isVisible || !hasMapInitialized) return
    const L = leafletRef.current
    if (!L) return

    markersRef.current.forEach(marker => mapRef.current?.removeLayer(marker))
    markersRef.current = []
    
    if (heatmapLayerRef.current) {
      mapRef.current.removeLayer(heatmapLayerRef.current)
      heatmapLayerRef.current = null
    }
    
    if (clusterLayerRef.current) {
      mapRef.current.removeLayer(clusterLayerRef.current)
      clusterLayerRef.current = null
    }

    const validReports = reports.filter(r => Number.isFinite(r.location?.latitude) && Number.isFinite(r.location?.longitude))

    if (viewMode === 'markers') {
      validReports.forEach(report => {
        const marker = L.marker([report.location.latitude, report.location.longitude], {
          icon: createCustomIcon(report.hazard_type, report.severity)
        })

        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${report.title}</h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${report.description}</p>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #888;">
              <span>Type: ${report.hazard_type}</span>
              <span>Severity: ${report.severity}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #888; margin-top: 4px;">
              <span>Status: ${report.status}</span>
              <span>Confidence: ${(report.confidence_score * 100).toFixed(0)}%</span>
            </div>
            <div style="font-size: 10px; color: #999; margin-top: 4px;">
              ${new Date(report.created_at).toLocaleString()}
            </div>
          </div>
        `
        
        marker.bindPopup(popupContent)
        marker.on('click', () => {
          if (onReportClick) {
            onReportClick(report)
          }
        })

        marker.addTo(mapRef.current!)
        markersRef.current.push(marker)
      })
    } else if (viewMode === 'clusters') {
      clusterLayerRef.current = L.layerGroup()
      const clusters: { [key: string]: OceanHazardReport[] } = {}
      const clusterRadius = 0.1

      validReports.forEach(report => {
        const lat = Math.round(report.location.latitude / clusterRadius) * clusterRadius
        const lng = Math.round(report.location.longitude / clusterRadius) * clusterRadius
        const key = `${lat},${lng}`
        if (!clusters[key]) clusters[key] = []
        clusters[key].push(report)
      })

      Object.entries(clusters).forEach(([key, clusterReports]) => {
        const [lat, lng] = key.split(',').map(Number)
        const count = clusterReports.length
        
        const mostSevere = clusterReports.reduce((prev, current) => {
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
          return severityOrder[current.severity as keyof typeof severityOrder] > 
                 severityOrder[prev.severity as keyof typeof severityOrder] ? current : prev
        })

        const clusterIcon = L.divIcon({
          className: 'cluster-marker',
          html: `
            <div style="
              width: ${Math.min(40 + count * 2, 60)}px;
              height: ${Math.min(40 + count * 2, 60)}px;
              background-color: ${getHazardColor(mostSevere.hazard_type)};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              color: white;
              font-weight: bold;
            ">
              ${count}
            </div>
          `,
          iconSize: [Math.min(40 + count * 2, 60), Math.min(40 + count * 2, 60)],
          iconAnchor: [Math.min(40 + count * 2, 60) / 2, Math.min(40 + count * 2, 60) / 2]
        })

        const clusterMarker = L.marker([lat, lng], { icon: clusterIcon })
        const popupContent = `
          <div style="min-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">Cluster (${count} reports)</h3>
            <div style="max-height: 200px; overflow-y: auto;">
              ${clusterReports.map(report => `
                <div style="border-bottom: 1px solid #eee; padding: 4px 0; font-size: 12px;">
                  <div style="font-weight: bold;">${report.title}</div>
                  <div style="color: #666;">${report.hazard_type} - ${report.severity}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `
        
        clusterMarker.bindPopup(popupContent)
        if (clusterLayerRef.current) clusterMarker.addTo(clusterLayerRef.current)
      })

      if (clusterLayerRef.current) clusterLayerRef.current.addTo(mapRef.current!)
    } else if (viewMode === 'heatmap') {
      heatmapLayerRef.current = L.layerGroup()
      
      validReports.forEach(report => {
        const intensity = report.severity === 'critical' ? 1 : 
                         report.severity === 'high' ? 0.8 :
                         report.severity === 'medium' ? 0.6 : 0.4
        
        const radius = 20 + (intensity * 30)
        const opacity = 0.3 + (intensity * 0.4)
        
        const circle = L.circle([report.location.latitude, report.location.longitude], {
          radius: radius * 1000,
          fillColor: getHazardColor(report.hazard_type),
          fillOpacity: opacity,
          color: getHazardColor(report.hazard_type),
          weight: 1,
          opacity: 0.8
        })

        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${report.title}</h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${report.description}</p>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #888;">
              <span>Type: ${report.hazard_type}</span>
              <span>Severity: ${report.severity}</span>
            </div>
            <div style="font-size: 10px; color: #999; margin-top: 4px;">
              Intensity: ${(intensity * 100).toFixed(0)}%
            </div>
          </div>
        `
        
        circle.bindPopup(popupContent)
        if (heatmapLayerRef.current) circle.addTo(heatmapLayerRef.current)
      })

      if (heatmapLayerRef.current) heatmapLayerRef.current.addTo(mapRef.current!)
    }

    if (validReports.length > 0) {
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current)
        if (group.getBounds().isValid()) {
          mapRef.current.fitBounds(group.getBounds(), { padding: [20, 20] })
          return
        }
      }
      const latLngs = validReports.map(r => L.latLng(r.location.latitude, r.location.longitude))
      if (latLngs.length === 1) {
        mapRef.current.setView(latLngs[0], 12)
      } else if (latLngs.length > 1) {
        const bounds = L.latLngBounds(latLngs)
        if (bounds.isValid()) mapRef.current.fitBounds(bounds, { padding: [20, 20] })
      }
    }
  }, [reports, viewMode, onReportClick, isVisible, hasMapInitialized])

  // Force resize when map initializes
  useEffect(() => {
    if (hasMapInitialized && mapRef.current) {
      console.log(' Forcing map resize...');
      // Force multiple reflows to fix tile rendering
      const resizeMap = () => {
        if (mapRef.current) {
          mapRef.current.invalidateSize({ pan: false });
          console.log(' Map resized');
        }
      };
      
      resizeMap();
      setTimeout(resizeMap, 100);
      setTimeout(resizeMap, 300);
      setTimeout(resizeMap, 600);
      setTimeout(resizeMap, 1000);
    }
  }, [hasMapInitialized])

  const hasReports = Array.isArray(reports) && reports.some(r => Number.isFinite(r.location?.latitude) && Number.isFinite(r.location?.longitude))
  
  return (
    <div className={`relative w-full h-full ${className}`} style={{ minHeight: '400px' }}>
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
        aria-label="Map"
      />

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-[1001]">
          <div className="text-center p-4">
            <p className="text-red-600 font-semibold">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {!hasMapInitialized && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[1001]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {hasMapInitialized && !hasReports && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
          <div className="rounded-md bg-white/90 px-4 py-2 text-sm text-gray-700 border border-gray-200 shadow-sm">
            No reports available yet
          </div>
        </div>
      )}
    </div>
  )
}