// Alert Rules Engine for SamudraSetu
import { createClient } from '@supabase/supabase-js';
import { OceanHazardReport, AlertNotification } from './database';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AlertRule {
  id: string
  name: string
  description: string
  conditions: AlertCondition[]
  actions: AlertAction[]
  enabled: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  updated_at: string
}

export interface AlertCondition {
  type: 'report_count' | 'severity_threshold' | 'time_window' | 'location_proximity' | 'social_activity' | 'official_data'
  operator: 'greater_than' | 'less_than' | 'equals' | 'contains' | 'within_radius'
  value: any
  field?: string
  timeWindow?: number // in minutes
  location?: {
    latitude: number
    longitude: number
    radius: number // in kilometers
  }
}

export interface AlertAction {
  type: 'send_notification' | 'create_alert' | 'escalate' | 'auto_verify' | 'send_sms' | 'send_email'
  target: string[]
  message?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  delay?: number // in minutes
}

export class AlertRulesEngine {
  private rules: AlertRule[] = []
  private isRunning = false

  async start() {
    if (this.isRunning) return
    this.isRunning = true

    console.log('Starting Alert Rules Engine...')
    
    // Load rules from database
    await this.loadRules()
    
    // Check rules every 5 minutes
    setInterval(() => this.checkRules(), 5 * 60 * 1000)
    
    // Initial check
    await this.checkRules()
  }

  async stop() {
    this.isRunning = false
    console.log('Alert Rules Engine stopped')
  }

  async loadRules() {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .eq('enabled', true)
        .order('priority', { ascending: false })

      if (error) throw error
      this.rules = data || []
      
      console.log(`Loaded ${this.rules.length} alert rules`)
    } catch (error) {
      console.error('Error loading alert rules:', error)
    }
  }

  async checkRules() {
    if (!this.isRunning) return

    try {
      console.log('Checking alert rules...')
      
      for (const rule of this.rules) {
        const triggered = await this.evaluateRule(rule)
        
        if (triggered) {
          console.log(`Alert rule triggered: ${rule.name}`)
          await this.executeActions(rule)
        }
      }
    } catch (error) {
      console.error('Error checking alert rules:', error)
    }
  }

  async evaluateRule(rule: AlertRule): Promise<boolean> {
    try {
      for (const condition of rule.conditions) {
        const conditionMet = await this.evaluateCondition(condition)
        if (!conditionMet) {
          return false
        }
      }
      return true
    } catch (error) {
      console.error(`Error evaluating rule ${rule.name}:`, error)
      return false
    }
  }

  async evaluateCondition(condition: AlertCondition): Promise<boolean> {
    switch (condition.type) {
      case 'report_count':
        return await this.checkReportCount(condition)
      
      case 'severity_threshold':
        return await this.checkSeverityThreshold(condition)
      
      case 'time_window':
        return await this.checkTimeWindow(condition)
      
      case 'location_proximity':
        return await this.checkLocationProximity(condition)
      
      case 'social_activity':
        return await this.checkSocialActivity(condition)
      
      case 'official_data':
        return await this.checkOfficialData(condition)
      
      default:
        console.warn(`Unknown condition type: ${condition.type}`)
        return false
    }
  }

  private async checkReportCount(condition: AlertCondition): Promise<boolean> {
    try {
      const timeWindow = condition.timeWindow || 60 // Default 1 hour
      const since = new Date(Date.now() - timeWindow * 60 * 1000)
      
      let query = supabase
        .from('ocean_hazard_reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since.toISOString())

      if (condition.field) {
        query = query.eq(condition.field, condition.value)
      }

      const { count, error } = await query

      if (error) throw error

      return this.compareValues(count || 0, condition.operator, condition.value)
    } catch (error) {
      console.error('Error checking report count:', error)
      return false
    }
  }

  private async checkSeverityThreshold(condition: AlertCondition): Promise<boolean> {
    try {
      const timeWindow = condition.timeWindow || 60
      const since = new Date(Date.now() - timeWindow * 60 * 1000)
      
      const { data, error } = await supabase
        .from('ocean_hazard_reports')
        .select('severity')
        .gte('created_at', since.toISOString())

      if (error) throw error

      const criticalCount = data?.filter(r => r.severity === 'critical').length || 0
      const highCount = data?.filter(r => r.severity === 'high').length || 0
      
      const totalSevere = criticalCount + highCount
      return this.compareValues(totalSevere, condition.operator, condition.value)
    } catch (error) {
      console.error('Error checking severity threshold:', error)
      return false
    }
  }

  private async checkTimeWindow(condition: AlertCondition): Promise<boolean> {
    try {
      const timeWindow = condition.timeWindow || 60
      const since = new Date(Date.now() - timeWindow * 60 * 1000)
      
      const { data, error } = await supabase
        .from('ocean_hazard_reports')
        .select('created_at')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) return false

      // Check if reports are coming in rapid succession
      const recentReports = data.slice(0, condition.value)
      if (recentReports.length < condition.value) return false

      const timeSpan = new Date(recentReports[0].created_at).getTime() - 
                      new Date(recentReports[recentReports.length - 1].created_at).getTime()
      
      const timeSpanMinutes = timeSpan / (1000 * 60)
      return this.compareValues(timeSpanMinutes, condition.operator, condition.timeWindow || 60)
    } catch (error) {
      console.error('Error checking time window:', error)
      return false
    }
  }

  private async checkLocationProximity(condition: AlertCondition): Promise<boolean> {
    try {
      if (!condition.location) return false

      const { data, error } = await supabase
        .rpc('get_nearby_reports', {
          user_lat: condition.location.latitude,
          user_lon: condition.location.longitude,
          radius_km: condition.location.radius
        })

      if (error) throw error

      return this.compareValues(data?.length || 0, condition.operator, condition.value)
    } catch (error) {
      console.error('Error checking location proximity:', error)
      return false
    }
  }

  private async checkSocialActivity(condition: AlertCondition): Promise<boolean> {
    try {
      const timeWindow = condition.timeWindow || 60
      const since = new Date(Date.now() - timeWindow * 60 * 1000)
      
      const { data, error } = await supabase
        .from('social_media_feeds')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since.toISOString())
        .gt('relevance_score', 0.3)

      if (error) throw error

      return this.compareValues(data?.length || 0, condition.operator, condition.value)
    } catch (error) {
      console.error('Error checking social activity:', error)
      return false
    }
  }

  private async checkOfficialData(condition: AlertCondition): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('official_data_feeds')
        .select('*')
        .eq('source', condition.field)
        .eq('feed_type', condition.value)
        .gte('valid_from', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error

      return data && data.length > 0
    } catch (error) {
      console.error('Error checking official data:', error)
      return false
    }
  }

  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'greater_than':
        return actual > expected
      case 'less_than':
        return actual < expected
      case 'equals':
        return actual === expected
      case 'contains':
        return String(actual).toLowerCase().includes(String(expected).toLowerCase())
      case 'within_radius':
        return actual <= expected
      default:
        return false
    }
  }

  async executeActions(rule: AlertRule) {
    try {
      for (const action of rule.actions) {
        if (action.delay && action.delay > 0) {
          // Execute with delay
          setTimeout(() => this.executeAction(action, rule), action.delay * 60 * 1000)
        } else {
          await this.executeAction(action, rule)
        }
      }
    } catch (error) {
      console.error(`Error executing actions for rule ${rule.name}:`, error)
    }
  }

  async executeAction(action: AlertAction, rule: AlertRule) {
    try {
      switch (action.type) {
        case 'send_notification':
          await this.sendNotification(action, rule)
          break
        
        case 'create_alert':
          await this.createAlert(action, rule)
          break
        
        case 'escalate':
          await this.escalateAlert(action, rule)
          break
        
        case 'auto_verify':
          await this.autoVerifyReports(action, rule)
          break
        
        case 'send_sms':
          await this.sendSMS(action, rule)
          break
        
        case 'send_email':
          await this.sendEmail(action, rule)
          break
        
        default:
          console.warn(`Unknown action type: ${action.type}`)
      }
    } catch (error) {
      console.error(`Error executing action ${action.type}:`, error)
    }
  }

  private async sendNotification(action: AlertAction, rule: AlertRule) {
    // Implementation for sending push notifications
    console.log(`Sending notification for rule: ${rule.name}`)
  }

  private async createAlert(action: AlertAction, rule: AlertRule) {
    const alertData = {
      title: action.message || `Alert: ${rule.name}`,
      message: rule.description,
      alert_type: 'general',
      severity: action.severity || rule.priority,
      target_roles: action.target,
      created_by: 'system'
    }

    const { error } = await supabase
      .from('alert_notifications')
      .insert([alertData])

    if (error) {
      console.error('Error creating alert:', error)
    }
  }

  private async escalateAlert(action: AlertAction, rule: AlertRule) {
    // Implementation for escalating alerts to higher authorities
    console.log(`Escalating alert for rule: ${rule.name}`)
  }

  private async autoVerifyReports(action: AlertAction, rule: AlertRule) {
    // Implementation for auto-verifying reports based on rules
    console.log(`Auto-verifying reports for rule: ${rule.name}`)
  }

  private async sendSMS(action: AlertAction, rule: AlertRule) {
    // Implementation for sending SMS notifications
    console.log(`Sending SMS for rule: ${rule.name}`)
  }

  private async sendEmail(action: AlertAction, rule: AlertRule) {
    // Implementation for sending email notifications
    console.log(`Sending email for rule: ${rule.name}`)
  }

  // Rule management methods
  async createRule(rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .insert([{
          ...rule,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      // Reload rules
      await this.loadRules()
      
      return data?.[0]
    } catch (error) {
      console.error('Error creating rule:', error)
      throw error
    }
  }

  async updateRule(id: string, updates: Partial<AlertRule>) {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      // Reload rules
      await this.loadRules()
      
      return data?.[0]
    } catch (error) {
      console.error('Error updating rule:', error)
      throw error
    }
  }

  async deleteRule(id: string) {
    try {
      const { error } = await supabase
        .from('alert_rules')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Reload rules
      await this.loadRules()
    } catch (error) {
      console.error('Error deleting rule:', error)
      throw error
    }
  }

  getRules(): AlertRule[] {
    return this.rules
  }

  getRuleById(id: string): AlertRule | undefined {
    return this.rules.find(rule => rule.id === id)
  }
}

export const alertRulesEngine = new AlertRulesEngine();
