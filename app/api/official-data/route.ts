import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// INCOIS API integration
async function fetchINCOISData() {
  try {
    const response = await fetch('https://www.incois.gov.in/portal/osf/osfIoData.jsp?serviceName=OSF_IOData', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SamudraSetu/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`INCOIS API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Process INCOIS data and store in database
    const processedData = {
      source: 'INCOIS',
      feed_type: 'ocean_data',
      data: {
        sea_surface_temperature: data.sst,
        sea_level: data.sl,
        wave_height: data.wh,
        wave_direction: data.wd,
        current_speed: data.cs,
        current_direction: data.cd,
        timestamp: new Date().toISOString()
      },
      location: {
        latitude: data.lat || null,
        longitude: data.lon || null
      },
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    // Store in database
    const { error } = await supabase
      .from('official_data_feeds')
      .insert([processedData])

    if (error) {
      console.error('Error storing INCOIS data:', error)
    }

    return processedData
  } catch (error) {
    console.error('Error fetching INCOIS data:', error)
    return null
  }
}

// IMD API integration
async function fetchIMDData() {
  try {
    const response = await fetch('https://mausam.imd.gov.in/data/nowcast/nowcast_data.json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SamudraSetu/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`IMD API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Process IMD data
    const processedData = {
      source: 'IMD',
      feed_type: 'weather_alert',
      data: {
        weather_conditions: data.weather,
        wind_speed: data.wind_speed,
        wind_direction: data.wind_direction,
        pressure: data.pressure,
        humidity: data.humidity,
        visibility: data.visibility,
        timestamp: new Date().toISOString()
      },
      location: {
        latitude: data.lat || null,
        longitude: data.lon || null
      },
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours
    }

    // Store in database
    const { error } = await supabase
      .from('official_data_feeds')
      .insert([processedData])

    if (error) {
      console.error('Error storing IMD data:', error)
    }

    return processedData
  } catch (error) {
    console.error('Error fetching IMD data:', error)
    return null
  }
}

// NOAA API integration
async function fetchNOAAData() {
  try {
    const apiKey = process.env.NOAA_API_KEY
    if (!apiKey) {
      console.warn('NOAA API key not configured')
      return null
    }

    const response = await fetch(`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=water_level&application=NOS.COOPS.TAC.WL&begin_date=${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&end_date=${new Date().toISOString().split('T')[0]}&datum=MLLW&station=9414290&time_zone=GMT&units=english&interval=h&format=json&application=NOS.COOPS.TAC.WL&api_key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SamudraSetu/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`NOAA API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Process NOAA data
    const processedData = {
      source: 'NOAA',
      feed_type: 'sea_level',
      data: {
        water_levels: data.data || [],
        station_info: data.metadata || {},
        timestamp: new Date().toISOString()
      },
      location: {
        latitude: 37.7749, // San Francisco Bay (example station)
        longitude: -122.4194
      },
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hours
    }

    // Store in database
    const { error } = await supabase
      .from('official_data_feeds')
      .insert([processedData])

    if (error) {
      console.error('Error storing NOAA data:', error)
    }

    return processedData
  } catch (error) {
    console.error('Error fetching NOAA data:', error)
    return null
  }
}

// Tsunami Early Warning System (INCOIS)
async function fetchTsunamiWarning() {
  try {
    const response = await fetch('https://www.incois.gov.in/portal/osf/osfIoData.jsp?serviceName=OSF_TSUNAMI', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SamudraSetu/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`Tsunami warning API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Check for active tsunami warnings
    if (data.warning && data.warning !== 'NONE') {
      const processedData = {
        source: 'INCOIS',
        feed_type: 'tsunami_warning',
        data: {
          warning_level: data.warning,
          affected_areas: data.areas || [],
          estimated_arrival: data.eta,
          magnitude: data.magnitude,
          epicenter: data.epicenter,
          timestamp: new Date().toISOString()
        },
        location: {
          latitude: data.epicenter?.lat || null,
          longitude: data.epicenter?.lon || null
        },
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
      }

      // Store in database
      const { error } = await supabase
        .from('official_data_feeds')
        .insert([processedData])

      if (error) {
        console.error('Error storing tsunami warning:', error)
      }

      return processedData
    }

    return null
  } catch (error) {
    console.error('Error fetching tsunami warning:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')
    const forceRefresh = searchParams.get('refresh') === 'true'

    // If specific source requested
    if (source) {
      let data = null
      switch (source.toLowerCase()) {
        case 'incois':
          data = await fetchINCOISData()
          break
        case 'imd':
          data = await fetchIMDData()
          break
        case 'noaa':
          data = await fetchNOAAData()
          break
        case 'tsunami':
          data = await fetchTsunamiWarning()
          break
        default:
          return NextResponse.json({ error: 'Invalid source' }, { status: 400 })
      }

      return NextResponse.json({ 
        success: true, 
        source, 
        data,
        timestamp: new Date().toISOString()
      })
    }

    // Fetch all sources
    const [incoisData, imdData, noaaData, tsunamiData] = await Promise.all([
      fetchINCOISData(),
      fetchIMDData(),
      fetchNOAAData(),
      fetchTsunamiWarning()
    ])

    return NextResponse.json({
      success: true,
      sources: {
        incois: incoisData,
        imd: imdData,
        noaa: noaaData,
        tsunami: tsunamiData
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in official data API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch official data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'store_manual_data':
        // Store manually entered official data
        const { error } = await supabase
          .from('official_data_feeds')
          .insert([{
            ...data,
            created_at: new Date().toISOString()
          }])

        if (error) {
          throw error
        }

        return NextResponse.json({ success: true })

      case 'trigger_alert':
        // Trigger alert based on official data
        const alertData = {
          title: data.title || 'Official Alert',
          message: data.message,
          alert_type: data.alert_type || 'general',
          severity: data.severity || 'medium',
          target_roles: data.target_roles || ['citizen'],
          created_by: 'system'
        }

        const { error: alertError } = await supabase
          .from('alert_notifications')
          .insert([alertData])

        if (alertError) {
          throw alertError
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in official data POST:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
