'use client'

import { useEffect, useState } from 'react'
import FacilitiesMap from '@/components/FacilitiesMap'
import { fetchNearbyFacilities, type FacilityRecord, type FacilityType } from '@/lib/facilities'
import Link from 'next/link'

export default function CitizenFacilitiesPage() {
  const [center, setCenter] = useState<{lat: number; lng: number}>({ lat: 15.4989, lng: 73.8278 })
  const [loading, setLoading] = useState(false)
  const [facilities, setFacilities] = useState<FacilityRecord[]>([])
  const [types, setTypes] = useState<FacilityType[]>(['hospital', 'police', 'water', 'electricity'])
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [radius, setRadius] = useState(5000)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fav = localStorage.getItem('citizen_facility_favorites')
      if (fav) setFavorites(JSON.parse(fav))
    }
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      })
    }
  }, [])

  const persistFavorites = (ids: string[]) => {
    setFavorites(ids)
    if (typeof window !== 'undefined') {
      localStorage.setItem('citizen_facility_favorites', JSON.stringify(ids))
    }
  }

  const toggleFavorite = (id: string) => {
    persistFavorites(favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id])
  }

  const loadNearby = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchNearbyFacilities({ latitude: center.lat, longitude: center.lng, radiusMeters: radius, types, searchTerm: search })
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
  }, [center, types, radius])

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Find Nearby Facilities</h1>
          <p className="text-gray-600 text-sm sm:text-base">Hospitals, police, water & electricity offices near you</p>
        </div>

        <div className="mb-4 bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-col gap-3">
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

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <input
              type="text"
              placeholder="Search by name or area"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') loadNearby() }}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <div className="flex items-center gap-3">
              <label htmlFor="radius-range" className="text-sm text-gray-700 whitespace-nowrap">Radius</label>
              <input
                id="radius-range"
                type="range"
                min={1000}
                max={20000}
                step={500}
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                title="Select search radius"
                aria-label="Select search radius"
              />
              <span className="text-xs text-gray-600 w-14">{Math.round(radius/1000)} km</span>
              <button
                onClick={loadNearby}
                className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm shadow hover:shadow-md"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
            <FacilitiesMap center={center} facilities={facilities} height="60vh" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Results</h2>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{facilities.length}</span>
            </div>
            {loading && <div className="text-sm text-gray-600">Loading...</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
              {facilities.map(f => (
                <div key={f.id} className="p-3 rounded-xl border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/citizen/facilities/${f.id}`} className="font-medium hover:underline">{f.name}</Link>
                      <div className="text-xs text-gray-500 capitalize">{f.type}</div>
                      {f.address && <div className="text-sm text-gray-600 mt-1">{f.address}</div>}
                    </div>
                    <button
                      aria-label="Toggle favorite"
                      onClick={() => toggleFavorite(f.id)}
                      className={`text-sm px-2 py-1 rounded ${favorites.includes(f.id) ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {favorites.includes(f.id) ? '★' : '☆'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {f.contactNumber && (
                      <a href={`tel:${f.contactNumber}`} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Call</a>
                    )}
                    <a target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${center.lat}%2C${center.lng}%3B${f.latitude}%2C${f.longitude}`}
                       className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Directions</a>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${f.latitude}, ${f.longitude}`)}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                    >Copy coords</button>
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
