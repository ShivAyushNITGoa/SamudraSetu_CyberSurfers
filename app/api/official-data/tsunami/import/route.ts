import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const dynamic = 'force-dynamic'

type TsunamiRow = {
  year?: number
  month?: number | null
  day?: number | null
  hour?: number | null
  minute?: number | null
  second?: number | null
  validity?: number | null
  cause_code?: number | null
  earthquake_magnitude?: number | null
  country?: string | null
  location_name?: string | null
  latitude?: number | null
  longitude?: number | null
  max_water_height_m?: number | null
}

function toNum(v: string | undefined): number | null {
  if (v == null) return null
  const t = String(v).trim().replace(/^"|"$/g, '')
  if (t === '' ) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

function toStr(v: string | undefined): string | null {
  if (v == null) return null
  const t = String(v).trim()
  if (t === '' || t === '""') return null
  return t.replace(/^"|"$/g, '')
}

function parseTsv(tsv: string): TsunamiRow[] {
  const lines = tsv.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) return []
  // First line is header; second line might be a query line starting with [
  const dataLines = lines.slice(1).filter((l, idx) => !l.includes('Country = INDIA') || idx > 0)

  const rows: TsunamiRow[] = []
  for (const line of dataLines) {
    const cols = line.split('\t')
    // Columns based on provided file header
    const row: TsunamiRow = {
      year: toNum(cols[1] as any) ?? undefined,
      month: toNum(cols[2] as any),
      day: toNum(cols[3] as any),
      hour: toNum(cols[4] as any),
      minute: toNum(cols[5] as any),
      second: toNum(cols[6] as any),
      validity: toNum(cols[7] as any),
      cause_code: toNum(cols[8] as any),
      earthquake_magnitude: toNum(cols[9] as any),
      // cols[10] Vol, [11] More Info, [12] Deposits
      country: toStr(cols[13] as any),
      location_name: toStr(cols[14] as any),
      latitude: toNum(cols[15] as any),
      longitude: toNum(cols[16] as any),
      max_water_height_m: toNum(cols[17] as any),
    }
    if (row.year && row.country) rows.push(row)
  }
  return rows
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    const contentType = req.headers.get('content-type') || ''
    let tsv = ''
    if (contentType.startsWith('text/plain') || contentType.includes('tsv')) {
      tsv = await req.text()
    } else {
      const body = await req.json().catch(() => ({}))
      tsv = body.tsv || ''
    }

    if (!tsv || typeof tsv !== 'string') {
      return NextResponse.json({ error: 'Provide TSV data in body as text/plain or JSON { tsv }' }, { status: 400 })
    }

    const rows = parseTsv(tsv)
    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid rows parsed' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // Map rows to official_data_feeds entries (historical tsunami events)
    const records = rows.map(r => ({
      source: 'TSV_IMPORT',
      feed_type: 'tsunami_history',
      data: {
        year: r.year,
        month: r.month,
        day: r.day,
        time: [r.hour, r.minute, r.second].filter(v => v != null).join(':'),
        validity: r.validity,
        cause_code: r.cause_code,
        earthquake_magnitude: r.earthquake_magnitude,
        country: r.country,
        location_name: r.location_name,
        max_water_height_m: r.max_water_height_m,
      },
      location: r.latitude != null && r.longitude != null ? { latitude: r.latitude, longitude: r.longitude } : null,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }))

    // Insert in chunks to avoid payload limits
    const chunkSize = 500
    let inserted = 0
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize)
      const { error, count } = await supabase
        .from('official_data_feeds')
        .insert(chunk, { count: 'exact' })
      if (error) {
        return NextResponse.json({ error: error.message, details: error.details }, { status: 400 })
      }
      inserted += count || chunk.length
    }

    return NextResponse.json({ success: true, inserted, sample: records[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to import TSV' }, { status: 500 })
  }
}


