'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getFacilityById, type FacilityRecord } from '@/lib/facilities'
import FacilitiesMap from '@/components/FacilitiesMap'
import { ArrowLeft, Phone, MapPin, Clock, Star, StarOff, ExternalLink } from 'lucide-react'

export default function FacilityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const facilityId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string)

  const [facility, setFacility] = useState<FacilityRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await getFacilityById(facilityId)
        if (!data) {
          setError('Facility not found')
        }
        setFacility(data)
      } catch (e) {
        setError('Failed to load facility')
      } finally {
        setLoading(false)
      }
    }
    if (facilityId) load()
  }, [facilityId])

  const toggleFavorite = () => {
    setIsFavorite(prev => !prev)
    // TODO: Persist to localStorage or supabase profile preferences
  }

  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>
  if (!facility) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{facility.name}</h1>
          <button
            onClick={toggleFavorite}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? <Star className="h-5 w-5 text-yellow-500" /> : <StarOff className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Map */}
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden mb-4">
          <FacilitiesMap
            center={{ lat: facility.latitude, lng: facility.longitude }}
            facilities={[facility]}
            height="300px"
          />
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-4">
              <div className="text-sm text-gray-500 capitalize mb-1">{facility.type}</div>
              {facility.address && (
                <div className="flex items-start text-gray-700"><MapPin className="h-4 w-4 mt-0.5 mr-2" /> {facility.address}</div>
              )}
              <div className="flex items-center gap-3 mt-3">
                {facility.contactNumber && (
                  <a href={`tel:${facility.contactNumber}`} className="px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Call
                  </a>
                )}
                <a target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${facility.latitude}%2C${facility.longitude}`} className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-sm inline-flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" /> Directions
                </a>
                {facility.website && (
                  <a target="_blank" rel="noreferrer" href={facility.website} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm">Website</a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-2">Hours</h2>
              <div className="flex items-center text-gray-700"><Clock className="h-4 w-4 mr-2" />
                <div className="space-y-1">
                  <div>Weekday: {facility.hours?.weekday || '—'}</div>
                  <div>Weekend: {facility.hours?.weekend || '—'}</div>
                  {facility.hours?.emergency && <div className="text-green-700">Emergency services available</div>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-2">Amenities</h2>
              {facility.amenities && facility.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {facility.amenities.map(a => (
                    <span key={a} className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">{a}</span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-600">No amenities information.</div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-2">Citizen Feedback</h2>
              <div className="text-sm text-gray-600">Coming soon.</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-4">
              <h3 className="font-semibold mb-2">Report an issue for this facility</h3>
              <Link href={`/citizen/report?facilityId=${facility.id}`} className="block text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow hover:shadow-md">Report Issue</Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-4">
              <h3 className="font-semibold mb-2">Share</h3>
              <button onClick={() => navigator.share ? navigator.share({ title: facility.name, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)} className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700">Share facility</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
