export type FacilityType = 'hospital' | 'police' | 'water' | 'electricity' | 'municipal' | 'school' | 'transport'

export interface FacilityHours {
  weekday?: string
  weekend?: string
  emergency?: boolean
}

export interface FacilityRecord {
  id: string
  name: string
  type: FacilityType
  latitude: number
  longitude: number
  address?: string
  contactNumber?: string
  utilities?: string[]
  amenities?: string[]
  hours?: FacilityHours
  website?: string
  email?: string
  source?: string
}

export interface NearbyFacilitiesParams {
  latitude: number
  longitude: number
  radiusMeters?: number
  types?: FacilityType[]
  searchTerm?: string
}

function getDemoData(lat: number, lng: number): FacilityRecord[] {
  return [
    {
      id: 'demo-hospital-1',
      name: 'District Government Hospital',
      type: 'hospital',
      latitude: lat + 0.01,
      longitude: lng + 0.01,
      address: 'Main Road, City Center',
      contactNumber: '+91-011-12345678',
      utilities: ['Emergency', 'OPD'],
      amenities: ['Wheelchair Access', 'Pharmacy'],
      hours: { weekday: '24x7', weekend: '24x7', emergency: true },
      website: 'https://example.org/hospital',
      source: 'demo'
    },
    {
      id: 'demo-police-1',
      name: 'City Police Station',
      type: 'police',
      latitude: lat - 0.008,
      longitude: lng + 0.006,
      address: 'Sector 5, Near Market',
      contactNumber: '100',
      utilities: ['PCR'],
      amenities: ['Helpdesk'],
      hours: { weekday: '24x7', weekend: '24x7' },
      source: 'demo'
    },
    {
      id: 'demo-water-1',
      name: 'Water Supply Office',
      type: 'water',
      latitude: lat + 0.004,
      longitude: lng - 0.012,
      address: 'Ward Office Complex',
      contactNumber: '+91-1800-000-111',
      utilities: ['Consumer Support'],
      amenities: ['Token Counter'],
      hours: { weekday: '9:00–17:00', weekend: 'Closed' },
      source: 'demo'
    },
    {
      id: 'demo-electricity-1',
      name: 'Electricity Board Office',
      type: 'electricity',
      latitude: lat - 0.012,
      longitude: lng - 0.008,
      address: 'Utility Bhawan',
      contactNumber: '+91-191-222-3333',
      utilities: ['Outage Helpdesk'],
      amenities: ['Bill Payment'],
      hours: { weekday: '10:00–18:00', weekend: 'Closed' },
      source: 'demo'
    }
  ]
}

export async function fetchNearbyFacilities(params: NearbyFacilitiesParams): Promise<FacilityRecord[]> {
  const { latitude, longitude, types, searchTerm } = params
  const base = getDemoData(latitude, longitude)
  let filtered = types && types.length > 0 ? base.filter(b => types.includes(b.type)) : base
  if (searchTerm && searchTerm.trim()) {
    const q = searchTerm.toLowerCase()
    filtered = filtered.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.address?.toLowerCase().includes(q) ?? false)
    )
  }
  await new Promise(r => setTimeout(r, 200))
  return filtered
}

export async function getFacilityById(id: string, near?: { latitude: number; longitude: number }): Promise<FacilityRecord | null> {
  const lat = near?.latitude ?? 15.4989
  const lng = near?.longitude ?? 73.8278
  const all = getDemoData(lat, lng)
  const found = all.find(f => f.id === id) || null
  await new Promise(r => setTimeout(r, 100))
  return found
}

export async function searchFacilities(params: { query: string; latitude?: number; longitude?: number; types?: FacilityType[] }): Promise<FacilityRecord[]> {
  const lat = params.latitude ?? 15.4989
  const lng = params.longitude ?? 73.8278
  return fetchNearbyFacilities({ latitude: lat, longitude: lng, types: params.types, searchTerm: params.query })
}

// TODO: Integrate real data via OGD/API Setu or municipal endpoints when available.


