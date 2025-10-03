import { NextResponse } from 'next/server'

export const revalidate = 600

export async function GET() {
  try {
    const res = await fetch('https://las.incois.gov.in/las/getUI.do', {
      headers: { 'User-Agent': 'SamudraSetu/1.0' },
      next: { revalidate }
    })
    const json = await res.json().catch(async () => ({ text: await res.text() }))
    return NextResponse.json(json, {
      status: res.status,
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}


