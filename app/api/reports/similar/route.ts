import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const lat = Number(searchParams.get('lat') || 'NaN')
    const lng = Number(searchParams.get('lng') || 'NaN')
    const limit = Math.min(Number(searchParams.get('limit') || '10'), 20)

    if (!q || q.length < 3) {
      return NextResponse.json({ items: [] })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    if (!url || !anonKey) {
      return NextResponse.json({ items: [] })
    }

    const client = createClient(url, anonKey, { auth: { persistSession: false } })

    // Fetch recent reports with lightweight fields; filter by title/description
    const { data, error } = await client
      .from('ocean_hazard_reports')
      .select('id, title, description, status, address, location, created_at')
      .ilike('title', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.warn('similar search error:', error)
      return NextResponse.json({ items: [] })
    }

    const rows = Array.isArray(data) ? data : []

    function normLoc(loc: any) {
      try {
        const parsed = typeof loc === 'string' ? JSON.parse(loc) : loc
        if (parsed && Array.isArray(parsed?.coordinates)) {
          return { lat: Number(parsed.coordinates[1]), lng: Number(parsed.coordinates[0]) }
        }
        if (typeof parsed?.latitude === 'number' && typeof parsed?.longitude === 'number') {
          return { lat: parsed.latitude, lng: parsed.longitude }
        }
      } catch {}
      return { lat: NaN, lng: NaN }
    }

    function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
      if (!isFinite(aLat) || !isFinite(aLng) || !isFinite(bLat) || !isFinite(bLng)) return Number.POSITIVE_INFINITY
      const R = 6371
      const dLat = (bLat - aLat) * Math.PI / 180
      const dLon = (bLng - aLng) * Math.PI / 180
      const sa = Math.sin(dLat/2) ** 2 + Math.cos(aLat * Math.PI/180) * Math.cos(bLat * Math.PI/180) * Math.sin(dLon/2) ** 2
      return 2 * R * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa))
    }

    const withScore = rows.map((r) => {
      const loc = normLoc((r as any).location)
      const dist = distanceKm(lat, lng, loc.lat, loc.lng)
      // Simple score: distance weight then recency
      const score = (isFinite(dist) ? dist : 9999) + (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24)
      return { id: r.id, title: r.title, status: r.status, address: r.address, lat: loc.lat, lng: loc.lng, score }
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)

    return NextResponse.json({ items: withScore })
  } catch (e: any) {
    return NextResponse.json({ items: [] })
  }
}


