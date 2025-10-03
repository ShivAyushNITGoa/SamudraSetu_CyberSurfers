// Alert and Notification System for SamudraSetu
// Handles automated alerts, threshold monitoring, and multi-channel notifications

import { supabase } from './supabase'
import { AlertThreshold, AlertNotification, NotificationTemplate } from './enhanced-database'

export class AlertNotificationSystem {
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null
  private thresholds: AlertThreshold[] = []

  constructor() {
    this.loadAlertThresholds()
  }

  // Load alert thresholds from database
  private async loadAlertThresholds(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .eq('is_active', true)

      if (error) throw error
      this.thresholds = data || []
      console.log(`🚨 Loaded ${this.thresholds.length} alert thresholds`)
    } catch (error) {
      console.error('❌ Error loading alert thresholds:', error)
    }
  }

  // Start the alert monitoring system
  public async startMonitoring(): Promise<void> {
    if (this.isRunning) return
    this.isRunning = true
    console.log('🚨 Starting alert monitoring system...')

    // Check thresholds every minute
    this.intervalId = setInterval(async () => {
      try {
        await this.checkAllThresholds()
      } catch (error) {
        console.error('❌ Error checking alert thresholds:', error)
      }
    }, 60000) // Check every minute

    // Initial check
    await this.checkAllThresholds()
  }

  // Stop the alert monitoring system
  public stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('🛑 Alert monitoring system stopped')
  }

  // Check all active thresholds
  private async checkAllThresholds(): Promise<void> {
    for (const threshold of this.thresholds) {
      try {
        await this.checkThreshold(threshold)
      } catch (error) {
        console.error(`❌ Error checking threshold ${threshold.name}:`, error)
      }
    }
  }

  // Check a specific threshold
  private async checkThreshold(threshold: AlertThreshold): Promise<void> {
    const conditions = threshold.conditions
    let shouldTrigger = false
    let triggerData: any = {}

    // Check minimum reports condition
    if (conditions.min_reports) {
      const reportCount = await this.getReportCount(threshold)
      if (reportCount >= conditions.min_reports) {
        shouldTrigger = true
        triggerData.report_count = reportCount
      }
    }

    // Check confidence threshold
    if (conditions.min_confidence) {
      const avgConfidence = await this.getAverageConfidence(threshold)
      if (avgConfidence >= conditions.min_confidence) {
        shouldTrigger = true
        triggerData.avg_confidence = avgConfidence
      }
    }

    // Check sentiment threshold
    if (conditions.sentiment_threshold) {
      const sentimentScore = await this.getSentimentScore(threshold)
      if (Math.abs(sentimentScore) >= conditions.sentiment_threshold) {
        shouldTrigger = true
        triggerData.sentiment_score = sentimentScore
      }
    }

    if (shouldTrigger) {
      await this.triggerAlert(threshold, triggerData)
    }
  }

  // Get report count for threshold conditions
  private async getReportCount(threshold: AlertThreshold): Promise<number> {
    const timeWindow = threshold.time_window_minutes
    const startTime = new Date(Date.now() - timeWindow * 60 * 1000).toISOString()

    let query = supabase
      .from('ocean_hazard_reports')
      .select('*', { count: 'exact', head: true })
      .eq('hazard_type', threshold.hazard_type)
      .gte('created_at', startTime)

    if (threshold.geographic_scope?.regions) {
      // TODO: Implement geographic filtering
    }

    const { count, error } = await query
    if (error) throw error
    return count || 0
  }

  // Get average confidence score for threshold conditions
  private async getAverageConfidence(threshold: AlertThreshold): Promise<number> {
    const timeWindow = threshold.time_window_minutes
    const startTime = new Date(Date.now() - timeWindow * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('ocean_hazard_reports')
      .select('confidence_score')
      .eq('hazard_type', threshold.hazard_type)
      .gte('created_at', startTime)

    if (error) throw error

    if (!data || data.length === 0) return 0

    const totalConfidence = data.reduce((sum, report) => sum + (report.confidence_score || 0), 0)
    return totalConfidence / data.length
  }

  // Get sentiment score for threshold conditions
  private async getSentimentScore(threshold: AlertThreshold): Promise<number> {
    const timeWindow = threshold.time_window_minutes
    const startTime = new Date(Date.now() - timeWindow * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('nlp_processing_results')
      .select('sentiment_score')
      .gte('processed_at', startTime)

    if (error) throw error

    if (!data || data.length === 0) return 0

    const totalSentiment = data.reduce((sum, result) => sum + (result.sentiment_score || 0), 0)
    return totalSentiment / data.length
  }

  // Trigger an alert
  private async triggerAlert(threshold: AlertThreshold, triggerData: any): Promise<void> {
    try {
      // Check if alert was recently triggered (cooldown)
      const cooldownTime = new Date(Date.now() - threshold.cooldown_minutes * 60 * 1000).toISOString()
      
      const { data: recentAlerts } = await supabase
        .from('alert_notifications')
        .select('id')
        .eq('alert_type', threshold.hazard_type)
        .gte('created_at', cooldownTime)
        .limit(1)

      if (recentAlerts && recentAlerts.length > 0) {
        console.log(`⏰ Alert for ${threshold.name} is in cooldown period`)
        return
      }

      // Create alert notification
      const alert = await this.createAlertNotification(threshold, triggerData)
      
      // Send notifications
      await this.sendNotifications(alert, threshold.actions)

      console.log(`🚨 Alert triggered: ${threshold.name}`)
    } catch (error) {
      console.error('❌ Error triggering alert:', error)
    }
  }

  // Create alert notification
  private async createAlertNotification(threshold: AlertThreshold, triggerData: any): Promise<AlertNotification> {
    const title = this.generateAlertTitle(threshold, triggerData)
    const message = this.generateAlertMessage(threshold, triggerData)

    const { data, error } = await supabase
      .from('alert_notifications')
      .insert({
        title,
        message,
        alert_type: threshold.hazard_type as any,
        severity: threshold.severity_threshold,
        target_roles: threshold.actions.target_roles,
        target_locations: threshold.geographic_scope,
        created_by: threshold.created_by
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Generate alert title
  private generateAlertTitle(threshold: AlertThreshold, triggerData: any): string {
    const hazardType = this.getHazardTypeDisplayName(threshold.hazard_type)
    const severity = threshold.severity_threshold.toUpperCase()
    
    return `${severity} ALERT: ${hazardType} Detected`
  }

  // Generate alert message
  private generateAlertMessage(threshold: AlertThreshold, triggerData: any): string {
    const hazardType = this.getHazardTypeDisplayName(threshold.hazard_type)
    const reportCount = triggerData.report_count || 0
    const confidence = triggerData.avg_confidence || 0
    const timeWindow = threshold.time_window_minutes

    return `Multiple ${hazardType} reports detected in the last ${timeWindow} minutes. ` +
           `Report count: ${reportCount}, Average confidence: ${(confidence * 100).toFixed(1)}%. ` +
           `Please review and take appropriate action.`
  }

  // Send notifications through multiple channels
  private async sendNotifications(alert: AlertNotification, actions: any): Promise<void> {
    const { send_notification, target_roles, notification_type } = actions

    if (!send_notification) return

    // Get target users
    const targetUsers = await this.getTargetUsers(target_roles, alert.target_locations)

    // Send through different channels
    for (const user of targetUsers) {
      try {
        // Email notification
        await this.sendEmailNotification(user, alert)
        
        // SMS notification (for critical alerts)
        if (notification_type === 'urgent' || notification_type === 'critical') {
          await this.sendSMSNotification(user, alert)
        }
        
        // Push notification
        await this.sendPushNotification(user, alert)
        
        // In-app notification
        await this.sendInAppNotification(user, alert)
      } catch (error) {
        console.error(`❌ Error sending notification to user ${user.id}:`, error)
      }
    }

    // Update alert as sent
    await supabase
      .from('alert_notifications')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', alert.id)
  }

  // Get target users for notifications
  private async getTargetUsers(targetRoles: string[], targetLocations?: any): Promise<any[]> {
    let query = supabase
      .from('profiles')
      .select('*')
      .in('role', targetRoles)

    // TODO: Implement geographic filtering based on targetLocations

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  // Send email notification
  private async sendEmailNotification(user: any, alert: AlertNotification): Promise<void> {
    try {
      const template = await this.getNotificationTemplate('email', alert.alert_type)
      
      const emailData = {
        to: user.email,
        subject: template?.subject || alert.title,
        html: this.processTemplate(template?.message || alert.message, {
          user_name: user.name,
          alert_title: alert.title,
          alert_message: alert.message,
          severity: alert.severity
        })
      }

      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      console.log(`📧 Email notification sent to ${user.email}: ${alert.title}`)
    } catch (error) {
      console.error('❌ Error sending email notification:', error)
    }
  }

  // Send SMS notification
  private async sendSMSNotification(user: any, alert: AlertNotification): Promise<void> {
    try {
      if (!user.phone) return

      const template = await this.getNotificationTemplate('sms', alert.alert_type)
      const message = this.processTemplate(template?.message || alert.message, {
        user_name: user.name,
        alert_title: alert.title,
        alert_message: alert.message
      })

      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      console.log(`📱 SMS notification sent to ${user.phone}: ${message}`)
    } catch (error) {
      console.error('❌ Error sending SMS notification:', error)
    }
  }

  // Send push notification
  private async sendPushNotification(user: any, alert: AlertNotification): Promise<void> {
    try {
      // TODO: Implement push notification service (Firebase, OneSignal, etc.)
      console.log(`🔔 Push notification sent to user ${user.id}: ${alert.title}`)
    } catch (error) {
      console.error('❌ Error sending push notification:', error)
    }
  }

  // Send in-app notification
  private async sendInAppNotification(user: any, alert: AlertNotification): Promise<void> {
    try {
      // Store in-app notification in database
      await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user.id,
          activity_type: 'alert_received',
          activity_data: {
            alert_id: alert.id,
            alert_title: alert.title,
            alert_type: alert.alert_type,
            severity: alert.severity
          }
        })

      console.log(`🔔 In-app notification stored for user ${user.id}`)
    } catch (error) {
      console.error('❌ Error sending in-app notification:', error)
    }
  }

  // Get notification template
  private async getNotificationTemplate(type: string, alertType: string): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('type', type)
        .eq('name', alertType)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('❌ Error getting notification template:', error)
      return null
    }
  }

  // Process template with variables
  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template
    for (const [key, value] of Object.entries(variables)) {
      processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    return processed
  }

  // Get hazard type display name
  private getHazardTypeDisplayName(hazardType: string): string {
    const displayNames: Record<string, string> = {
      tsunami: 'Tsunami',
      cyclone: 'Cyclone',
      flooding: 'Flooding',
      storm_surge: 'Storm Surge',
      erosion: 'Coastal Erosion',
      unusual_tides: 'Unusual Tides',
      coastal_damage: 'Coastal Damage',
      marine_pollution: 'Marine Pollution',
      weather_anomaly: 'Weather Anomaly'
    }
    
    return displayNames[hazardType] || hazardType
  }

  // Manual alert creation
  public async createManualAlert(
    title: string,
    message: string,
    alertType: string,
    severity: string,
    targetRoles: string[],
    targetLocations?: any
  ): Promise<AlertNotification> {
    try {
      const { data, error } = await supabase
        .from('alert_notifications')
        .insert({
          title,
          message,
          alert_type: alertType as any,
          severity: severity as any,
          target_roles: targetRoles,
          target_locations: targetLocations
        })
        .select()
        .single()

      if (error) throw error

      // Send notifications immediately
      await this.sendNotifications(data, {
        send_notification: true,
        target_roles: targetRoles,
        notification_type: severity === 'critical' ? 'critical' : 'warning'
      })

      console.log(`🚨 Manual alert created: ${title}`)
      return data
    } catch (error) {
      console.error('❌ Error creating manual alert:', error)
      throw error
    }
  }

  // Get alert history
  public async getAlertHistory(limit: number = 50): Promise<AlertNotification[]> {
    try {
      const { data, error } = await supabase
        .from('alert_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error getting alert history:', error)
      throw error
    }
  }
}

export const alertNotificationSystem = new AlertNotificationSystem()
