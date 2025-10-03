import { NextResponse } from 'next/server'

const INCOIS_LAS_BASE_URL = 'https://las.incois.gov.in/las/UI.vm'
const INCOIS_LAS_GET_UI = 'https://las.incois.gov.in/las/getUI.do'

// INCOIS LAS datasets and their corresponding API endpoints
const LAS_DATASETS = {
  // Ocean Surface Currents
  ocean_currents: {
    name: 'Ocean Surface Currents',
    endpoint: 'https://las.incois.gov.in/las/getData.do',
    variables: ['u', 'v'], // u and v components of current
    description: 'Real-time ocean surface current data'
  },
  // Sea Surface Temperature
  sst: {
    name: 'Sea Surface Temperature',
    endpoint: 'https://las.incois.gov.in/las/getData.do',
    variables: ['sst'],
    description: 'Sea surface temperature measurements'
  },
  // Sea Surface Height
  ssh: {
    name: 'Sea Surface Height',
    endpoint: 'https://las.incois.gov.in/las/getData.do',
    variables: ['ssh'],
    description: 'Sea surface height anomalies'
  },
  // Wave Height
  wave_height: {
    name: 'Significant Wave Height',
    endpoint: 'https://las.incois.gov.in/las/getData.do',
    variables: ['hs'],
    description: 'Significant wave height data'
  }
}

interface LASDataRequest {
  dataset: string
  variable: string
  timeRange: {
    start: string
    end: string
  }
  spatialRange: {
    north: number
    south: number
    east: number
    west: number
  }
  format?: 'netcdf' | 'ascii' | 'json'
}

export const revalidate = 300 // 5 minutes cache

/**
 * Extract data from INCOIS LAS (Live Access Server)
 */
async function fetchLASData(request: LASDataRequest) {
  try {
    const { dataset, variable, timeRange, spatialRange, format = 'json' } = request
    
    // Construct LAS query parameters
    const params = new URLSearchParams({
      dataset: dataset,
      variable: variable,
      time_start: timeRange.start,
      time_end: timeRange.end,
      north: spatialRange.north.toString(),
      south: spatialRange.south.toString(),
      east: spatialRange.east.toString(),
      west: spatialRange.west.toString(),
      format: format
    })

    const lasUrl = `${LAS_DATASETS[dataset as keyof typeof LAS_DATASETS]?.endpoint}?${params}`
    
    const response = await fetch(lasUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SamudraSetu/1.0',
        'Referer': INCOIS_LAS_BASE_URL
      },
      next: { revalidate }
    })

    if (!response.ok) {
      throw new Error(`LAS API error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    
    // Transform LAS data to our standard format
    return {
      source: 'INCOIS_LAS',
      dataset: dataset,
      variable: variable,
      data: data,
      metadata: {
        timeRange,
        spatialRange,
        format,
        extractedAt: new Date().toISOString(),
        lasUrl
      }
    }
  } catch (error) {
    console.error('Error fetching LAS data:', error)
    throw error
  }
}

/**
 * Get available datasets from INCOIS LAS
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    // Return available datasets
    if (action === 'datasets') {
      return NextResponse.json({
        success: true,
        datasets: LAS_DATASETS,
        baseUrl: INCOIS_LAS_BASE_URL,
        timestamp: new Date().toISOString()
      })
    }

    // Proxy INCOIS LAS getUI.do (for dataset/variable discovery)
    if (action === 'ui') {
      const uiResponse = await fetch(INCOIS_LAS_GET_UI, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'User-Agent': 'SamudraSetu/1.0',
          'Referer': INCOIS_LAS_BASE_URL
        },
        next: { revalidate }
      })

      if (!uiResponse.ok) {
        return NextResponse.json({ error: `Failed to load LAS UI (${uiResponse.status})` }, { status: 502 })
      }

      const html = await uiResponse.text()

      return NextResponse.json({
        success: true,
        url: INCOIS_LAS_GET_UI,
        html,
        timestamp: new Date().toISOString()
      })
    }

    // Extract specific data
    const dataset = searchParams.get('dataset')
    const variable = searchParams.get('variable')
    const timeStart = searchParams.get('time_start')
    const timeEnd = searchParams.get('time_end')
    const north = searchParams.get('north')
    const south = searchParams.get('south')
    const east = searchParams.get('east')
    const west = searchParams.get('west')
    const format = searchParams.get('format') as 'netcdf' | 'ascii' | 'json' || 'json'

    if (!dataset || !variable) {
      return NextResponse.json({
        error: 'Missing required parameters: dataset and variable',
        availableDatasets: Object.keys(LAS_DATASETS)
      }, { status: 400 })
    }

    // Default time range: last 24 hours
    const defaultTimeEnd = new Date().toISOString()
    const defaultTimeStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // Default spatial range: Indian Ocean region
    const defaultSpatialRange = {
      north: 30,
      south: -30,
      east: 120,
      west: 40
    }

    const dataRequest: LASDataRequest = {
      dataset,
      variable,
      timeRange: {
        start: timeStart || defaultTimeStart,
        end: timeEnd || defaultTimeEnd
      },
      spatialRange: {
        north: north ? parseFloat(north) : defaultSpatialRange.north,
        south: south ? parseFloat(south) : defaultSpatialRange.south,
        east: east ? parseFloat(east) : defaultSpatialRange.east,
        west: west ? parseFloat(west) : defaultSpatialRange.west
      },
      format
    }

    const result = await fetchLASData(dataRequest)

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error in LAS API:', error)
    return NextResponse.json({
      error: 'Failed to fetch LAS data',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * POST endpoint for complex LAS data requests
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const {
      dataset,
      variable,
      timeRange,
      spatialRange,
      format = 'json'
    } = body

    if (!dataset || !variable || !timeRange || !spatialRange) {
      return NextResponse.json({
        error: 'Missing required fields: dataset, variable, timeRange, spatialRange'
      }, { status: 400 })
    }

    const dataRequest: LASDataRequest = {
      dataset,
      variable,
      timeRange,
      spatialRange,
      format
    }

    const result = await fetchLASData(dataRequest)

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error in LAS POST API:', error)
    return NextResponse.json({
      error: 'Failed to process LAS data request',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
