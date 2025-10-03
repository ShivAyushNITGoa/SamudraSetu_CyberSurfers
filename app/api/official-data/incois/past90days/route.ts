import { NextResponse } from 'next/server'

export const revalidate = 900 // 15 minutes

export async function GET() {
  try {
    const url = 'https://tsunami.incois.gov.in/itews/DSSProducts/OPR/past90days.json'
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SamudraSetu/1.0 (+github.com)' 
      },
      // Let Next cache at the edge
      next: { revalidate }
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch INCOIS data' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(
      { success: true, data, timestamp: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800' } }
    )
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}


