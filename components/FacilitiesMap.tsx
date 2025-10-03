'use client'

import { useEffect, useMemo, useState } from 'react'
import Map from './Map'

export interface FacilityMarker {
  id: string
  name: string
  type: string
  latitude: number
  longitude: number
  address?: string
  contactNumber?: string
  utilities?: string[]
}

interface FacilitiesMapProps {
  center: { lat: number; lng: number }
  facilities: FacilityMarker[]
  height?: string
}

export default function FacilitiesMap({ center, facilities, height = '500px' }: FacilitiesMapProps) {
  const markers = useMemo(() => facilities.map(f => ({
    lat: f.latitude,
    lng: f.longitude,
    title: `${iconForType(f.type)} ${f.name}`,
    description: [f.address, f.contactNumber ? `☎ ${f.contactNumber}` : null, f.utilities?.length ? `• ${f.utilities.join(', ')}` : null]
      .filter(Boolean)
      .join(' | '),
    status: typeToStatus(f.type),
    facility: f
  })), [facilities])

  return (
    <Map
      center={center}
      zoom={12}
      markers={markers}
      height={height}
      showControls
      onMarkerClick={() => {}}
    />
  )
}

function iconForType(type: string) {
  switch (type) {
    case 'hospital': return '🏥'
    case 'police': return '🚔'
    case 'water': return '💧'
    case 'electricity': return '⚡'
    case 'municipal': return '🏛️'
    case 'school': return '🏫'
    case 'transport': return '🚌'
    default: return '📍'
  }
}

function typeToStatus(type: string): 'pending' | 'in_progress' | 'resolved' | 'closed' | undefined {
  switch (type) {
    case 'hospital': return 'resolved'
    case 'police': return 'in_progress'
    case 'water': return 'pending'
    case 'electricity': return 'pending'
    default: return undefined
  }
}


