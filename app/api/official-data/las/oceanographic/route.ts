import { NextResponse } from 'next/server'

// INCOIS LAS Oceanographic Data Extractor
// This endpoint provides specialized oceanographic data extraction from INCOIS LAS

const INCOIS_LAS_URL = 'https://las.incois.gov.in/las/UI.vm'

// Oceanographic parameters we can extract
const OCEANOGRAPHIC_PARAMETERS = {
  // Physical Oceanography
  sea_surface_temperature: {
    name: 'Sea Surface Temperature',
    unit: '°C',
    description: 'Temperature of the ocean surface layer',
    variables: ['sst'],
    hazard_relevance: 'high' // Important for storm intensity prediction
  },
  sea_surface_height: {
    name: 'Sea Surface Height',
    unit: 'm',
    description: 'Height of sea surface relative to geoid',
    variables: ['ssh', 'sla'],
    hazard_relevance: 'critical' // Direct indicator of storm surge potential
  },
  ocean_currents: {
    name: 'Ocean Surface Currents',
    unit: 'm/s',
    description: 'Speed and direction of surface ocean currents',
    variables: ['u', 'v'],
    hazard_relevance: 'high' // Affects storm surge propagation
  },
  significant_wave_height: {
    name: 'Significant Wave Height',
    unit: 'm',
    description: 'Average height of the highest one-third of waves',
    variables: ['hs'],
    hazard_relevance: 'critical' // Direct hazard indicator
  },
  wave_period: {
    name: 'Wave Period',
    unit: 's',
    description: 'Time between successive wave crests',
    variables: ['tp'],
    hazard_relevance: 'medium'
  },
  wave_direction: {
    name: 'Wave Direction',
    unit: 'degrees',
    description: 'Direction from which waves are coming',
    variables: ['dir'],
    hazard_relevance: 'medium'
  },
  // Chemical Oceanography
  salinity: {
    name: 'Sea Surface Salinity',
    unit: 'psu',
    description: 'Salt content of surface seawater',
    variables: ['sss'],
    hazard_relevance: 'low'
  },
  // Biological Oceanography
  chlorophyll_a: {
    name: 'Chlorophyll-a Concentration',
    unit: 'mg/m³',
    description: 'Indicator of phytoplankton biomass',
    variables: ['chl'],
    hazard_relevance: 'low'
  }
}

// Default spatial bounds for Indian Ocean region
const INDIAN_OCEAN_BOUNDS = {
  north: 30.0,
  south: -30.0,
  east: 120.0,
  west: 40.0
}

// Default time range: last 7 days
const DEFAULT_TIME_RANGE = {
  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  end: new Date().toISOString()
}

/**
 * Extract oceanographic data from INCOIS LAS
 */
async function extractOceanographicData(parameter: string, spatialBounds = INDIAN_OCEAN_BOUNDS, timeRange = DEFAULT_TIME_RANGE) {
  try {
    const paramConfig = OCEANOGRAPHIC_PARAMETERS[parameter as keyof typeof OCEANOGRAPHIC_PARAMETERS]
    
    if (!paramConfig) {
      throw new Error(`Unknown oceanographic parameter: ${parameter}`)
    }

    // Construct LAS query
    const queryParams = new URLSearchParams({
      dataset: 'oceanographic',
      variable: paramConfig.variables[0], // Use primary variable
      time_start: timeRange.start,
      time_end: timeRange.end,
      north: spatialBounds.north.toString(),
      south: spatialBounds.south.toString(),
      east: spatialBounds.east.toString(),
      west: spatialBounds.west.toString(),
      format: 'json'
    })

    const lasUrl = `https://las.incois.gov.in/las/getData.do?${queryParams}`
    
    const response = await fetch(lasUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SamudraSetu/1.0',
        'Referer': INCOIS_LAS_URL
      }
    })

    if (!response.ok) {
      throw new Error(`LAS request failed: ${response.status}`)
    }

    const rawData = await response.json()
    
    // Process and normalize the data
    const processedData = {
      parameter: parameter,
      name: paramConfig.name,
      unit: paramConfig.unit,
      description: paramConfig.description,
      hazard_relevance: paramConfig.hazard_relevance,
      data: rawData,
      metadata: {
        source: 'INCOIS_LAS',
        extractedAt: new Date().toISOString(),
        spatialBounds,
        timeRange,
        lasUrl
      }
    }

    return processedData
  } catch (error) {
    console.error(`Error extracting ${parameter} data:`, error)
    throw error
  }
}

/**
 * Analyze oceanographic data for hazard indicators
 */
function analyzeHazardIndicators(data: any) {
  const indicators = {
    storm_surge_risk: 'low',
    wave_hazard: 'low',
    temperature_anomaly: 'normal',
    current_strength: 'normal'
  }

  // Simple analysis based on data values
  if (data.parameter === 'sea_surface_height') {
    const maxHeight = Math.max(...(data.data?.values || [0]))
    if (maxHeight > 0.5) indicators.storm_surge_risk = 'high'
    else if (maxHeight > 0.2) indicators.storm_surge_risk = 'medium'
  }

  if (data.parameter === 'significant_wave_height') {
    const maxWaveHeight = Math.max(...(data.data?.values || [0]))
    if (maxWaveHeight > 4) indicators.wave_hazard = 'high'
    else if (maxWaveHeight > 2) indicators.wave_hazard = 'medium'
  }

  if (data.parameter === 'sea_surface_temperature') {
    const avgTemp = data.data?.values?.reduce((a: number, b: number) => a + b, 0) / data.data?.values?.length || 0
    if (avgTemp > 30) indicators.temperature_anomaly = 'high'
    else if (avgTemp < 20) indicators.temperature_anomaly = 'low'
  }

  return indicators
}

export const revalidate = 600 // 10 minutes cache

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const parameter = searchParams.get('parameter')
    
    // Return available parameters
    if (action === 'parameters') {
      return NextResponse.json({
        success: true,
        parameters: OCEANOGRAPHIC_PARAMETERS,
        defaultBounds: INDIAN_OCEAN_BOUNDS,
        timestamp: new Date().toISOString()
      })
    }

    // Extract specific parameter data
    if (!parameter) {
      return NextResponse.json({
        error: 'Parameter is required',
        availableParameters: Object.keys(OCEANOGRAPHIC_PARAMETERS)
      }, { status: 400 })
    }

    // Parse optional parameters
    const north = searchParams.get('north') ? parseFloat(searchParams.get('north')!) : INDIAN_OCEAN_BOUNDS.north
    const south = searchParams.get('south') ? parseFloat(searchParams.get('south')!) : INDIAN_OCEAN_BOUNDS.south
    const east = searchParams.get('east') ? parseFloat(searchParams.get('east')!) : INDIAN_OCEAN_BOUNDS.east
    const west = searchParams.get('west') ? parseFloat(searchParams.get('west')!) : INDIAN_OCEAN_BOUNDS.west
    
    const timeStart = searchParams.get('time_start') || DEFAULT_TIME_RANGE.start
    const timeEnd = searchParams.get('time_end') || DEFAULT_TIME_RANGE.end

    const spatialBounds = { north, south, east, west }
    const timeRange = { start: timeStart, end: timeEnd }

    const data = await extractOceanographicData(parameter, spatialBounds, timeRange)
    const hazardIndicators = analyzeHazardIndicators(data)

    return NextResponse.json({
      success: true,
      ...data,
      hazardIndicators,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error in oceanographic data API:', error)
    return NextResponse.json({
      error: 'Failed to extract oceanographic data',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { parameters, spatialBounds, timeRange } = body

    if (!parameters || !Array.isArray(parameters)) {
      return NextResponse.json({
        error: 'Parameters array is required'
      }, { status: 400 })
    }

    // Extract multiple parameters
    const results = await Promise.allSettled(
      parameters.map((param: string) => 
        extractOceanographicData(
          param, 
          spatialBounds || INDIAN_OCEAN_BOUNDS, 
          timeRange || DEFAULT_TIME_RANGE
        )
      )
    )

    const successful = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value)

    const failed = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason)

    return NextResponse.json({
      success: true,
      extractedParameters: successful,
      failedParameters: failed,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error in oceanographic data POST API:', error)
    return NextResponse.json({
      error: 'Failed to process oceanographic data request',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
