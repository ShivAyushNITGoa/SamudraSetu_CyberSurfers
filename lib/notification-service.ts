/**
 * Real-time Notifications and Alerts System
 * Handles SMS, Email, and Push notifications for ocean hazards
 */

import { createClient } from '@supabase/supabase-js';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    hazardType?: string[];
    severityLevel?: string[];
    reportCount?: number;
    timeWindow?: number; // minutes
    location?: {
      lat: number;
      lng: number;
      radius: number; // km
    };
  };
  actions: {
    sms?: boolean;
    email?: boolean;
    push?: boolean;
    targetRoles?: string[];
    targetUsers?: string[];
  };
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'push';
  subject?: string;
  message: string;
  language: string;
  variables: string[];
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  alert_type: 'tsunami' | 'storm_surge' | 'flooding' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  target_roles: string[];
  target_locations?: any;
  sent_at?: string;
  created_by: string;
  created_at: string;
}

class NotificationService {
  private supabase: any;
  private twilioConfig?: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
  private sendGridConfig?: {
    apiKey: string;
    fromEmail: string;
  };
  private firebaseConfig?: {
    projectId: string;
    privateKey: string;
    clientEmail: string;
  };

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    config?: {
      twilio?: any;
      sendGrid?: any;
      firebase?: any;
    }
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.twilioConfig = config?.twilio;
    this.sendGridConfig = config?.sendGrid;
    this.firebaseConfig = config?.firebase;
  }

  /**
   * Process new reports and check alert rules
   */
  async processNewReport(report: any): Promise<void> {
    try {
      // Get all enabled alert rules
      const { data: alertRules, error } = await this.supabase
        .from('alert_rules')
        .select('*')
        .eq('enabled', true);

      if (error) {
        console.error('Error fetching alert rules:', error);
        return;
      }

      if (!alertRules || alertRules.length === 0) {
        return;
      }

      // Check each rule
      for (const rule of alertRules) {
        if (await this.checkAlertRule(rule, report)) {
          await this.triggerAlert(rule, report);
        }
      }
    } catch (error) {
      console.error('Error processing new report:', error);
    }
  }

  /**
   * Check if an alert rule matches the report
   */
  private async checkAlertRule(rule: AlertRule, report: any): Promise<boolean> {
    const conditions = rule.conditions;

    // Check hazard type
    if (conditions.hazardType && !conditions.hazardType.includes(report.hazard_type)) {
      return false;
    }

    // Check severity level
    if (conditions.severityLevel && !conditions.severityLevel.includes(report.severity)) {
      return false;
    }

    // Check location if specified
    if (conditions.location) {
      const distance = this.calculateDistance(
        report.location.lat,
        report.location.lng,
        conditions.location.lat,
        conditions.location.lng
      );
      if (distance > conditions.location.radius) {
        return false;
      }
    }

    // Check report count in time window
    if (conditions.reportCount && conditions.timeWindow) {
      const cutoffTime = new Date(Date.now() - conditions.timeWindow * 60 * 1000);
      const { data: recentReports } = await this.supabase
        .from('ocean_hazard_reports')
        .select('id')
        .gte('created_at', cutoffTime.toISOString())
        .eq('hazard_type', report.hazard_type);

      if (!recentReports || recentReports.length < conditions.reportCount) {
        return false;
      }
    }

    return true;
  }

  /**
   * Trigger an alert based on a rule
   */
  private async triggerAlert(rule: AlertRule, report: any): Promise<void> {
    try {
      // Get notification template
      const template = await this.getNotificationTemplate(rule.priority);
      if (!template) {
        console.error('No notification template found for priority:', rule.priority);
        return;
      }

      // Get target users
      const targetUsers = await this.getTargetUsers(rule.actions);
      if (targetUsers.length === 0) {
        console.log('No target users found for alert');
        return;
      }

      // Create alert notification record
      const alertNotification: AlertNotification = {
        id: crypto.randomUUID(),
        title: this.formatMessage(template.subject || template.message, report),
        message: this.formatMessage(template.message, report),
        alert_type: this.mapHazardTypeToAlertType(report.hazard_type),
        severity: rule.priority,
        target_roles: rule.actions.targetRoles || [],
        target_locations: conditions.location ? {
          type: 'Point',
          coordinates: [conditions.location.lng, conditions.location.lat]
        } : undefined,
        created_by: 'system',
        created_at: new Date().toISOString()
      };

      // Save alert notification
      await this.supabase
        .from('alert_notifications')
        .insert([alertNotification]);

      // Send notifications
      for (const user of targetUsers) {
        if (rule.actions.sms && user.phone) {
          await this.sendSMS(user.phone, alertNotification.message);
        }
        if (rule.actions.email && user.email) {
          await this.sendEmail(user.email, alertNotification.title, alertNotification.message);
        }
        if (rule.actions.push && user.id) {
          await this.sendPushNotification(user.id, alertNotification.title, alertNotification.message);
        }
      }

      console.log(`Alert triggered: ${rule.name} for ${targetUsers.length} users`);
    } catch (error) {
      console.error('Error triggering alert:', error);
    }
  }

  /**
   * Get notification template by priority
   */
  private async getNotificationTemplate(priority: string): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('notification_templates')
        .select('*')
        .eq('type', 'email')
        .eq('language', 'en')
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }

      return data[0];
    } catch (error) {
      console.error('Error fetching notification template:', error);
      return null;
    }
  }

  /**
   * Get target users based on alert actions
   */
  private async getTargetUsers(actions: AlertRule['actions']): Promise<any[]> {
    try {
      let query = this.supabase
        .from('profiles')
        .select('*');

      if (actions.targetRoles && actions.targetRoles.length > 0) {
        query = query.in('role', actions.targetRoles);
      }

      if (actions.targetUsers && actions.targetUsers.length > 0) {
        query = query.in('id', actions.targetUsers);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching target users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error fetching target users:', error);
      return [];
    }
  }

  /**
   * Format message with report data
   */
  private formatMessage(template: string, report: any): string {
    return template
      .replace('{hazard_type}', report.hazard_type)
      .replace('{severity}', report.severity)
      .replace('{location}', report.address || 'Unknown location')
      .replace('{timestamp}', new Date(report.created_at).toLocaleString())
      .replace('{description}', report.description);
  }

  /**
   * Map hazard type to alert type
   */
  private mapHazardTypeToAlertType(hazardType: string): 'tsunami' | 'storm_surge' | 'flooding' | 'general' {
    switch (hazardType) {
      case 'tsunami': return 'tsunami';
      case 'storm_surge': return 'storm_surge';
      case 'flooding': return 'flooding';
      default: return 'general';
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(phoneNumber: string, message: string): Promise<void> {
    if (!this.twilioConfig) {
      console.log('Twilio not configured, skipping SMS');
      return;
    }

    try {
      const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + this.twilioConfig.accountSid + '/Messages.json', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(this.twilioConfig.accountSid + ':' + this.twilioConfig.authToken),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phoneNumber,
          From: this.twilioConfig.fromNumber,
          Body: message
        })
      });

      if (!response.ok) {
        throw new Error(`SMS failed: ${response.status}`);
      }

      console.log(`SMS sent to ${phoneNumber}`);
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(email: string, subject: string, message: string): Promise<void> {
    if (!this.sendGridConfig) {
      console.log('SendGrid not configured, skipping email');
      return;
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + this.sendGridConfig.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email }]
          }],
          from: { email: this.sendGridConfig.fromEmail },
          subject,
          content: [{
            type: 'text/plain',
            value: message
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Email failed: ${response.status}`);
      }

      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(userId: string, title: string, message: string): Promise<void> {
    if (!this.firebaseConfig) {
      console.log('Firebase not configured, skipping push notification');
      return;
    }

    try {
      // In a real implementation, you would use Firebase Admin SDK
      // This is a placeholder for the push notification logic
      console.log(`Push notification sent to user ${userId}: ${title}`);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Create a new alert rule
   */
  async createAlertRule(rule: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    try {
      const newRule: AlertRule = {
        id: crypto.randomUUID(),
        ...rule
      };

      const { data, error } = await this.supabase
        .from('alert_rules')
        .insert([newRule])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create alert rule: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating alert rule:', error);
      throw error;
    }
  }

  /**
   * Get all alert rules
   */
  async getAlertRules(): Promise<AlertRule[]> {
    try {
      const { data, error } = await this.supabase
        .from('alert_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alert rules:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error fetching alert rules:', error);
      return [];
    }
  }

  /**
   * Update an alert rule
   */
  async updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('alert_rules')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update alert rule: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating alert rule:', error);
      throw error;
    }
  }

  /**
   * Delete an alert rule
   */
  async deleteAlertRule(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('alert_rules')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete alert rule: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting alert rule:', error);
      throw error;
    }
  }
}

export default NotificationService;
