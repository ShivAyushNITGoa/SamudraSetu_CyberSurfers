'use client'

import { useEffect, useState } from 'react'
import FacilitiesMap from '@/components/FacilitiesMap'
import { fetchNearbyFacilities, type FacilityRecord, type FacilityType } from '@/lib/facilities'

export default function FacilitiesPage() {
  const [center, setCenter] = useState<{lat: number; lng: number}>({ lat: 15.4989, lng: 73.8278 })
  const [loading, setLoading] = useState(false)
  const [facilities, setFacilities] = useState<FacilityRecord[]>([])
  const [types, setTypes] = useState<FacilityType[]>(['hospital', 'police', 'water', 'electricity'])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      })
    }
  }, [])

  const loadNearby = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchNearbyFacilities({ latitude: center.lat, longitude: center.lng, radiusMeters: 5000, types })
      setFacilities(data)
    } catch (e) {
      setError('Failed to load facilities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNearby()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, types])

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nearby Government Facilities</h1>
          <p className="text-gray-600">Find hospitals, police, water & electricity offices near you</p>
        </div>

        <div className="mb-4 bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center text-sm">
            {(['hospital','police','water','electricity','municipal','school','transport'] as FacilityType[]).map(t => (
              <label key={t} className="inline-flex items-center gap-2">
                <input type="checkbox" checked={types.includes(t)} onChange={(e) => {
                  setTypes(prev => e.target.checked ? [...prev, t] : prev.filter(x => x !== t))
                }} />
                <span className="capitalize">{t}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadNearby} className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm">Refresh</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <FacilitiesMap center={center} facilities={facilities} height="600px" />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Results ({facilities.length})</h2>
            {loading && <div className="text-sm text-gray-600">Loading...</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="space-y-3">
              {facilities.map(f => (
                <div key={f.id} className="p-3 rounded border">
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{f.type}</div>
                  {f.address && <div className="text-sm text-gray-600 mt-1">{f.address}</div>}
                  <div className="flex items-center gap-2 mt-2">
                    {f.contactNumber && (
                      <a href={`tel:${f.contactNumber}`} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Call</a>
                    )}
                    <a target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${center.lat}%2C${center.lng}%3B${f.latitude}%2C${f.longitude}`}
                       className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Directions</a>
                  </div>
                </div>
              ))}
              {facilities.length === 0 && !loading && (
                <div className="text-sm text-gray-600">No facilities found for selected filters.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


