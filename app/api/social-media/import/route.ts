import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const dynamic = 'force-dynamic'

type CsvRow = Record<string, string>

function parseCsv(csv: string): CsvRow[] {
  const lines = csv.split(/\r?\n/).filter(l => l.length > 0)
  if (lines.length === 0) return []
  // Basic CSV parser supporting quoted fields with commas
  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') { current += '"'; i++ } else { inQuotes = false }
        } else { current += ch }
      } else {
        if (ch === '"') { inQuotes = true }
        else if (ch === ',') { result.push(current); current = '' }
        else { current += ch }
      }
    }
    result.push(current)
    return result
  }

  const header = parseLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
  const rows: CsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]).map(v => v.trim())
    if (cols.every(v => v === '')) continue
    const row: CsvRow = {}
    header.forEach((h, idx) => { row[h] = (cols[idx] || '').replace(/^"|"$/g, '') })
    rows.push(row)
  }
  return rows
}

function num(v?: string): number | null {
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function pick(row: CsvRow, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k]
    if (v != null && v !== '') return v
  }
  return undefined
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    const contentType = req.headers.get('content-type') || ''
    let csv = ''
    if (contentType.startsWith('text/plain') || contentType.includes('csv')) {
      csv = await req.text()
    } else {
      const body = await req.json().catch(() => ({}))
      csv = body.csv || ''
    }

    if (!csv || typeof csv !== 'string') {
      return NextResponse.json({ error: 'Provide CSV data in body as text/plain or JSON { csv }' }, { status: 400 })
    }

    const rows = parseCsv(csv)
    if (rows.length === 0) {
      return NextResponse.json({ error: 'No rows parsed from CSV' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const records = rows.map(r => {
      const text = pick(r, ['text', 'tweet', 'content', 'message']) || ''
      const author = pick(r, ['user', 'username', 'screen_name', 'author'])
      const created = pick(r, ['created_at', 'date', 'timestamp'])
      const lang = pick(r, ['lang', 'language']) || 'en'
      const lat = num(pick(r, ['lat', 'latitude', 'geo_lat']))
      const lon = num(pick(r, ['lon', 'lng', 'longitude', 'geo_lon']))
      const postId = pick(r, ['id', 'tweet_id', 'status_id']) || crypto.randomUUID()

      // simple keyword relevance
      const lower = text.toLowerCase()
      const keywords = ['tsunami','storm','surge','flood','wave','cyclone','coast','sea']
      const matched = keywords.filter(k => lower.includes(k))
      const relevance = matched.length > 0 ? Math.min(1, matched.length / 3) : 0

      return {
        platform: 'twitter',
        post_id: String(postId),
        content: text,
        author: author || null,
        location: lat != null && lon != null ? { latitude: lat, longitude: lon } : null,
        sentiment_score: 0,
        hazard_keywords: matched,
        relevance_score: relevance,
        language: lang || 'en',
        verified: false,
        created_at: created ? new Date(created).toISOString() : new Date().toISOString(),
      }
    })

    const chunkSize = 500
    let inserted = 0
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize)
      const { error, count } = await supabase
        .from('social_media_feeds')
        .insert(chunk, { count: 'exact' })
      if (error) {
        return NextResponse.json({ error: error.message, details: error.details }, { status: 400 })
      }
      inserted += count || chunk.length
    }

    return NextResponse.json({ success: true, inserted, sample: records[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to import CSV' }, { status: 500 })
  }
}


