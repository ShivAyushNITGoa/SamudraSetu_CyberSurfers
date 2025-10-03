import { NextRequest } from 'next/server'
import { GET } from '@/app/api/official-data/route'

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { session: { user: { id: 'test-user' } } },
      error: null,
    }),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({
      data: [
        {
          id: '1',
          source: 'INCOIS',
          feed_type: 'tsunami_warning',
          data: { warning_level: 'high' },
          location: { latitude: 12.9716, longitude: 77.5946 },
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 3600000).toISOString(),
        },
      ],
      error: null,
    }),
  })),
}

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => mockSupabase),
}))

describe('/api/official-data', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return official data successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/official-data')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(1)
    expect(data[0]).toHaveProperty('source', 'INCOIS')
    expect(data[0]).toHaveProperty('feed_type', 'tsunami_warning')
  })

  it('should return 401 when not authenticated', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/official-data')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('error', 'Unauthorized')
  })

  it('should handle database errors', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    })

    const request = new NextRequest('http://localhost:3000/api/official-data')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error', 'Failed to fetch official data')
  })

  it('should filter by feed type when provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/official-data?feedType=tsunami_warning')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockSupabase.from).toHaveBeenCalledWith('official_data_feeds')
  })

  it('should filter by location when provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/official-data?lat=12.9716&lon=77.5946&radius=10')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockSupabase.from).toHaveBeenCalledWith('official_data_feeds')
  })
})
