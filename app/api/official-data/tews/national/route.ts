import { NextResponse } from 'next/server'

export const revalidate = 600

export async function GET() {
  try {
    const res = await fetch('https://tsunami.incois.gov.in/TEWS/National.jsp', {
      headers: { 'User-Agent': 'SamudraSetu/1.0' },
      next: { revalidate }
    })
    const html = await res.text()
    return new NextResponse(html, {
      status: res.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}


