// Official Data Integration Service for SamudraSetu
// Integrates with INCOIS, IMD, NOAA, and other official data sources

import { supabase } from './supabase'
import { OfficialDataSource, OfficialDataFeed } from './enhanced-database'

export class OfficialDataIntegrationService {
  private dataSources: OfficialDataSource[] = []
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null

  constructor() {
    this.loadDataSources()
  }

  private async loadDataSources(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('official_data_feeds')
        .select('*')
        .eq('is_active', true)

      if (error) throw error
      this.dataSources = data || []
      console.log(`🌊 Loaded ${this.dataSources.length} official data sources`)
    } catch (error) {
      console.error('❌ Error loading official data sources:', error)
    }
  }

  public async startIntegration(): Promise<void> {
    if (this.isRunning) return
    this.isRunning = true
    console.log('🚀 Starting official data integration service...')

    for (const source of this.dataSources) {
      this.startDataSourceIntegration(source)
    }

    this.intervalId = setInterval(() => {
      this.loadDataSources()
    }, 300000) // Refresh every 5 minutes
  }

  public stopIntegration(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('🛑 Official data integration service stopped')
  }

  private startDataSourceIntegration(source: OfficialDataSource): void {
    const intervalMs = source.update_frequency_minutes * 60 * 1000

    setInterval(async () => {
      try {
        await this.fetchDataFromSource(source)
      } catch (error) {
        console.error(`❌ Error fetching from ${source.agency}:`, error)
        await this.updateSourceError(source.id, error instanceof Error ? error.message : 'Unknown error')
      }
    }, intervalMs)

    this.fetchDataFromSource(source)
  }

  private async fetchDataFromSource(source: OfficialDataSource): Promise<void> {
    console.log(`🌊 Fetching data from ${source.agency} - ${source.name}`)

    try {
      switch (source.agency) {
        case 'INCOIS':
          await this.fetchINCOISData(source)
          break
        case 'IMD':
          await this.fetchIMDData(source)
          break
        case 'NOAA':
          await this.fetchNOAAData(source)
          break
        case 'ESA':
          await this.fetchESAData(source)
          break
        default:
          await this.fetchGenericData(source)
      }

      await this.updateSourceSuccess(source.id)
    } catch (error) {
      console.error(`❌ Error fetching data from ${source.agency}:`, error)
      throw error
    }
  }

  private async fetchINCOISData(source: OfficialDataSource): Promise<void> {
    try {
      // INCOIS Tsunami Early Warning System
      if (source.data_type === 'tsunami') {
        const response = await fetch('https://www.incois.gov.in/tsunami/tsunami-early-warning')
        if (!response.ok) throw new Error(`INCOIS API error: ${response.status}`)

        const html = await response.text()
        const tsunamiData = this.parseINCOISTsunamiData(html)

        if (tsunamiData) {
          await this.storeOfficialDataFeed({
            source: source.name,
            feed_type: 'tsunami_warning',
            data: tsunamiData,
            valid_from: new Date().toISOString(),
            valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
        }
      }

      // INCOIS Ocean State Forecast
      if (source.data_type === 'ocean_monitoring') {
        const response = await fetch('https://www.incois.gov.in/portal/osf/osf.jsp')
        if (!response.ok) throw new Error(`INCOIS OSF API error: ${response.status}`)

        const oceanData = await this.parseINCOISOceanData(response)
        if (oceanData) {
          await this.storeOfficialDataFeed({
            source: source.name,
            feed_type: 'ocean_state_forecast',
            data: oceanData,
            valid_from: new Date().toISOString(),
            valid_until: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
          })
        }
      }
    } catch (error) {
      console.error('❌ INCOIS data fetch error:', error)
      throw error
    }
  }

  private async fetchIMDData(source: OfficialDataSource): Promise<void> {
    try {
      // IMD Cyclone Warning
      if (source.data_type === 'cyclone') {
        const response = await fetch('https://mausam.imd.gov.in/cyclone')
        if (!response.ok) throw new Error(`IMD API error: ${response.status}`)

        const html = await response.text()
        const cycloneData = this.parseIMDCycloneData(html)

        if (cycloneData) {
          await this.storeOfficialDataFeed({
            source: source.name,
            feed_type: 'cyclone_warning',
            data: cycloneData,
            valid_from: new Date().toISOString(),
            valid_until: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
          })
        }
      }

      // IMD Weather Data
      if (source.data_type === 'weather') {
        const response = await fetch('https://mausam.imd.gov.in/api/weather')
        if (!response.ok) throw new Error(`IMD Weather API error: ${response.status}`)

        const weatherData = await response.json()
        await this.storeOfficialDataFeed({
          source: source.name,
          feed_type: 'weather_forecast',
          data: weatherData,
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      }
    } catch (error) {
      console.error('❌ IMD data fetch error:', error)
      throw error
    }
  }

  private async fetchNOAAData(source: OfficialDataSource): Promise<void> {
    try {
      const { api_key } = source.configuration

      // NOAA Sea Level Data
      if (source.data_type === 'sea_level') {
        const response = await fetch(
          `https://tidesandcurrents.noaa.gov/api/datagetter?product=water_level&application=NOS.COOPS.TAC.WL&begin_date=${this.getDateString(-1)}&end_date=${this.getDateString(0)}&datum=MLLW&station=9414290&time_zone=GMT&units=metric&interval=h&format=json&api_key=${api_key}`
        )

        if (!response.ok) throw new Error(`NOAA API error: ${response.status}`)

        const seaLevelData = await response.json()
        await this.storeOfficialDataFeed({
          source: source.name,
          feed_type: 'sea_level_data',
          data: seaLevelData,
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      }

      // NOAA Weather Data
      if (source.data_type === 'weather') {
        const response = await fetch(
          `https://api.weather.gov/alerts/active?area=IN&severity=Severe,Extreme&api_key=${api_key}`
        )

        if (!response.ok) throw new Error(`NOAA Weather API error: ${response.status}`)

        const weatherAlerts = await response.json()
        await this.storeOfficialDataFeed({
          source: source.name,
          feed_type: 'weather_alerts',
          data: weatherAlerts,
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
        })
      }
    } catch (error) {
      console.error('❌ NOAA data fetch error:', error)
      throw error
    }
  }

  private async fetchESAData(source: OfficialDataSource): Promise<void> {
    try {
      // ESA Copernicus Marine Service
      const response = await fetch('https://marine.copernicus.eu/api/')
      if (!response.ok) throw new Error(`ESA API error: ${response.status}`)

      const marineData = await response.json()
      await this.storeOfficialDataFeed({
        source: source.name,
        feed_type: 'marine_monitoring',
        data: marineData,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    } catch (error) {
      console.error('❌ ESA data fetch error:', error)
      throw error
    }
  }

  private async fetchGenericData(source: OfficialDataSource): Promise<void> {
    try {
      if (!source.api_endpoint) return

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (source.api_key_required && source.configuration.api_key) {
        headers['Authorization'] = `Bearer ${source.configuration.api_key}`
      }

      const response = await fetch(source.api_endpoint, { headers })
      if (!response.ok) throw new Error(`Generic API error: ${response.status}`)

      const data = await response.json()
      await this.storeOfficialDataFeed({
        source: source.name,
        feed_type: source.data_type,
        data,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    } catch (error) {
      console.error('❌ Generic data fetch error:', error)
      throw error
    }
  }

  private async storeOfficialDataFeed(feedData: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('official_data_feeds')
        .insert(feedData)

      if (error) throw error
      console.log(`✅ Stored official data feed: ${feedData.source} - ${feedData.feed_type}`)
    } catch (error) {
      console.error('❌ Error storing official data feed:', error)
    }
  }

  private parseINCOISTsunamiData(html: string): any {
    // Parse INCOIS tsunami warning HTML
    // This is a simplified parser - in production, use proper HTML parsing
    const tsunamiRegex = /tsunami.*?warning/i
    const magnitudeRegex = /magnitude.*?(\d+\.?\d*)/i
    const locationRegex = /location.*?([A-Za-z\s,]+)/i

    if (tsunamiRegex.test(html)) {
      return {
        alert_type: 'tsunami_warning',
        magnitude: magnitudeRegex.exec(html)?.[1] || 'Unknown',
        location: locationRegex.exec(html)?.[1] || 'Unknown',
        timestamp: new Date().toISOString(),
        source: 'INCOIS'
      }
    }

    return null
  }

  private async parseINCOISOceanData(response: Response): Promise<any> {
    // Parse INCOIS ocean state forecast data
    const text = await response.text()
    
    // Extract wave height, wind speed, and other ocean parameters
    const waveHeightRegex = /wave.*?height.*?(\d+\.?\d*)/i
    const windSpeedRegex = /wind.*?speed.*?(\d+\.?\d*)/i

    return {
      wave_height: waveHeightRegex.exec(text)?.[1] || 'Unknown',
      wind_speed: windSpeedRegex.exec(text)?.[1] || 'Unknown',
      timestamp: new Date().toISOString(),
      source: 'INCOIS'
    }
  }

  private parseIMDCycloneData(html: string): any {
    // Parse IMD cyclone warning HTML
    const cycloneRegex = /cyclone.*?warning/i
    const intensityRegex = /intensity.*?(\d+)/i
    const trackRegex = /track.*?([A-Za-z\s,]+)/i

    if (cycloneRegex.test(html)) {
      return {
        alert_type: 'cyclone_warning',
        intensity: intensityRegex.exec(html)?.[1] || 'Unknown',
        track: trackRegex.exec(html)?.[1] || 'Unknown',
        timestamp: new Date().toISOString(),
        source: 'IMD'
      }
    }

    return null
  }

  private getDateString(daysOffset: number): string {
    const date = new Date()
    date.setDate(date.getDate() + daysOffset)
    return date.toISOString().split('T')[0]
  }

  private async updateSourceSuccess(sourceId: string): Promise<void> {
    await supabase
      .from('official_data_feeds')
      .update({
        last_successful_fetch: new Date().toISOString(),
        last_error: null
      })
      .eq('id', sourceId)
  }

  private async updateSourceError(sourceId: string, error: string): Promise<void> {
    await supabase
      .from('official_data_feeds')
      .update({
        last_error: error
      })
      .eq('id', sourceId)
  }
}

export const officialDataIntegration = new OfficialDataIntegrationService()