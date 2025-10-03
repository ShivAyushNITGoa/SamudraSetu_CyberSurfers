'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface SimpleMapProps {
  className?: string
  height?: string
}

export default function SimpleMap({ className = '', height = '400px' }: SimpleMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    console.log('Initializing SimpleMap...')

    try {
    // Create map with OpenStreetMap tiles
    mapRef.current = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946], // India center
        zoom: 6,
      zoomControl: true,
      attributionControl: true
    })

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(mapRef.current)

      console.log('SimpleMap initialized successfully')

      // Ensure map renders properly
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize()
          console.log('Map size invalidated')
        }
      }, 100)
    } catch (error) {
      console.error('Error initializing SimpleMap:', error)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div 
      ref={mapContainerRef} 
      className={`w-full ${className}`}
      style={{ height: height }}
    />
  )
}