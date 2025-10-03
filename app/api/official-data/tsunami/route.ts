import { NextResponse } from 'next/server'

const INCOIS_URL = 'https://tsunami.incois.gov.in/itews/DSSProducts/OPR/past90days.json'

export const revalidate = 120 // seconds: update at most every 2 minutes on the server

export async function GET() {
  try {
    const res = await fetch(INCOIS_URL, { next: { revalidate } })
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch INCOIS feed' }, { status: 502 })
    }
    const json = await res.json()

    const datasets = Array.isArray(json?.datasets) ? json.datasets : []
    const reports = datasets.map((d: any) => ({
      id: String(d.EVID),
      title: `${Number(d.MAGNITUDE).toFixed(1)}M event`,
      description: `${d.REGIONNAME} • ${d.ORIGINTIME}`,
      hazard_type: 'tsunami',
      severity: Number(d.MAGNITUDE) >= 8 ? 'critical' : Number(d.MAGNITUDE) >= 7 ? 'high' : 'medium',
      status: 'unverified',
      location: { latitude: Number(d.LATITUDE), longitude: Number(d.LONGITUDE) },
      created_at: new Date(String(d.ORIGINTIME).replace(' ', 'T') + 'Z').toISOString(),
      confidence_score: Math.min(0.95, Math.max(0.6, (Number(d.MAGNITUDE) - 6) / 3)),
      social_media_indicators: {}
    }))

    return NextResponse.json({
      source: 'INCOIS',
      url: INCOIS_URL,
      count: reports.length,
      reports,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Error fetching INCOIS feed' }, { status: 500 })
  }
}


