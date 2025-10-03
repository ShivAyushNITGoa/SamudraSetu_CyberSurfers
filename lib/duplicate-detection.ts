import { Report } from './database'

export interface DuplicateCandidate {
  id: string
  similarity: number // 0..1
}

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function jaccard(a: Set<string>, b: Set<string>) {
  const inter = new Set([...a].filter(x => b.has(x))).size
  const union = new Set([...a, ...b]).size
  return union === 0 ? 0 : inter / union
}

export function findDuplicates(
  source: Report,
  pool: Report[],
  opts: { radiusMeters?: number; minSimilarity?: number } = {}
): DuplicateCandidate[] {
  const { radiusMeters = 150, minSimilarity = 0.45 } = opts
  const srcText = normalize(`${source.title} ${source.description}`)
  const srcTokens = new Set(srcText.split(' '))
  const srcLoc = source.location
  const out: DuplicateCandidate[] = []

  for (const other of pool) {
    if (other.id === source.id) continue
    // Geospatial quick filter
    if (srcLoc && other.location) {
      const d = haversineMeters(srcLoc.latitude, srcLoc.longitude, other.location.latitude, other.location.longitude)
      if (d > radiusMeters) continue
    }
    // Text similarity
    const otherTokens = new Set(normalize(`${other.title} ${other.description}`).split(' '))
    const sim = jaccard(srcTokens, otherTokens)
    if (sim >= minSimilarity) out.push({ id: other.id, similarity: sim })
  }
  return out.sort((a, b) => b.similarity - a.similarity)
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}


