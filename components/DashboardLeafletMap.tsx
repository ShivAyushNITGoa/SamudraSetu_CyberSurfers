import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import OpenStreetMap from '@/components/OpenStreetMap'

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

interface DashboardLeafletMapProps {
	viewMode: 'markers' | 'clusters' | 'heatmap'
	className?: string
	height?: string
}

export default function DashboardLeafletMap({ viewMode, className = '', height = '100%' }: DashboardLeafletMapProps) {
	const [reports, setReports] = useState<OceanHazardReport[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const [subscription, setSubscription] = useState<any>(null)

	useEffect(() => {
		const loadReports = async () => {
			try {
				setLoading(true)
				const { data, error } = await supabase
					.from('view_public_reports_geojson')
					.select('*')
					.order('created_at', { ascending: false })
					.limit(100)
				if (error) throw error

				const toNum = (v: any) => (typeof v === 'string' ? parseFloat(v) : v)
				const normalizeLocation = (loc: any) => {
					try {
						if (!loc) return { latitude: 0, longitude: 0 }
						if (typeof loc === 'string' && loc.startsWith('POINT(')) {
							const m = loc.match(/POINT\(([^)]+)\)/)
							if (m) {
								const [lng, lat] = m[1].split(' ').map(parseFloat)
								if (isFinite(lat) && isFinite(lng)) return { latitude: lat, longitude: lng }
							}
						}
						const parsed = typeof loc === 'string' ? JSON.parse(loc) : loc
						if (parsed?.coordinates?.length >= 2) {
							const lng = toNum(parsed.coordinates[0]); const lat = toNum(parsed.coordinates[1])
							if (isFinite(lat) && isFinite(lng)) return { latitude: lat, longitude: lng }
						}
						if (parsed && (parsed.latitude !== undefined) && (parsed.longitude !== undefined)) {
							const lat = toNum(parsed.latitude); const lng = toNum(parsed.longitude)
							if (isFinite(lat) && isFinite(lng)) return { latitude: lat, longitude: lng }
						}
						if (parsed && (parsed.lat !== undefined) && (parsed.lng !== undefined)) {
							const lat = toNum(parsed.lat); const lng = toNum(parsed.lng)
							if (isFinite(lat) && isFinite(lng)) return { latitude: lat, longitude: lng }
						}
						return { latitude: 0, longitude: 0 }
					} catch {
						return { latitude: 0, longitude: 0 }
					}
				}

				const mapped: OceanHazardReport[] = (data || []).map((r: any) => ({
					...r,
					location: {
						latitude: Number(r.location?.coordinates?.[1] ?? 0),
						longitude: Number(r.location?.coordinates?.[0] ?? 0)
					}
				}))
				setReports(mapped)
			} catch (e) {
				setReports([])
			} finally {
				setLoading(false)
			}
		}
		loadReports()

		// Realtime subscription for inserts/updates/deletes
		try {
			const channel = (supabase as any).channel('ocean_hazard_reports_rt')
			  .on('postgres_changes', { event: '*', schema: 'public', table: 'ocean_hazard_reports' }, (payload: any) => {
				// Refetch lightweight; in production optimize by mutating local state per event
				loadReports()
			  })
			  .subscribe()
			setSubscription(channel)
		} catch {}

		return () => {
			try { subscription && (supabase as any).removeChannel(subscription) } catch {}
		}
	}, [])

	return (
		<div className={`w-full h-full ${className}`} style={{ height: height }}>
			<OpenStreetMap reports={reports} viewMode={viewMode} className="w-full h-full" />
			{loading && (
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<div className="rounded-md bg-white/80 px-4 py-2 text-sm text-gray-700 border border-gray-200 shadow-sm">
						Loading reports…
					</div>
				</div>
			)}
		</div>
	)
}
