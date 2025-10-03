// Workflow automation system for civic issues management

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  enabled: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logical_operator?: 'AND' | 'OR';
}

export interface WorkflowAction {
  type: 'assign_department' | 'set_priority' | 'send_notification' | 'add_tag' | 'set_status' | 'create_task' | 'escalate';
  parameters: Record<string, any>;
  delay?: number; // minutes
}

export interface WorkflowExecution {
  id: string;
  rule_id: string;
  issue_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  actions_executed: string[];
}

// Predefined workflow rules
export const DEFAULT_WORKFLOW_RULES: WorkflowRule[] = [
  {
    id: 'urgent-safety-escalation',
    name: 'Urgent Safety Issues Escalation',
    description: 'Automatically escalate urgent safety issues to emergency services',
    conditions: [
      { field: 'category', operator: 'equals', value: 'safety' },
      { field: 'priority', operator: 'equals', value: 'urgent' }
    ],
    actions: [
      { type: 'set_status', parameters: { status: 'in_progress' } },
      { type: 'assign_department', parameters: { department: 'Emergency Services' } },
      { type: 'send_notification', parameters: { 
        recipients: ['emergency@city.gov', 'safety@city.gov'],
        template: 'urgent_safety_alert',
        priority: 'high'
      } },
      { type: 'escalate', parameters: { level: 'immediate' } }
    ],
    enabled: true,
    priority: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'infrastructure-auto-assign',
    name: 'Infrastructure Auto-Assignment',
    description: 'Automatically assign infrastructure issues to Public Works department',
    conditions: [
      { field: 'category', operator: 'equals', value: 'infrastructure' },
      { field: 'priority', operator: 'in', value: ['medium', 'high'] }
    ],
    actions: [
      { type: 'assign_department', parameters: { department: 'Public Works' } },
      { type: 'set_priority', parameters: { priority: 'medium' } },
      { type: 'add_tag', parameters: { tags: ['auto-assigned', 'infrastructure'] } }
    ],
    enabled: true,
    priority: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'environmental-weekend-escalation',
    name: 'Weekend Environmental Issues',
    description: 'Escalate environmental issues reported on weekends',
    conditions: [
      { field: 'category', operator: 'equals', value: 'environment' },
      { field: 'created_at', operator: 'greater_than', value: 'weekend' } // This would need custom logic
    ],
    actions: [
      { type: 'set_priority', parameters: { priority: 'high' } },
      { type: 'send_notification', parameters: { 
        recipients: ['environment@city.gov'],
        template: 'weekend_environmental_alert'
      } }
    ],
    enabled: true,
    priority: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'duplicate-detection',
    name: 'Duplicate Issue Detection',
    description: 'Detect and flag potential duplicate issues',
    conditions: [
      { field: 'title', operator: 'contains', value: 'similar_title' }, // This would need ML
      { field: 'location', operator: 'equals', value: 'nearby_location' } // This would need geospatial logic
    ],
    actions: [
      { type: 'add_tag', parameters: { tags: ['potential-duplicate'] } },
      { type: 'send_notification', parameters: { 
        recipients: ['admin@city.gov'],
        template: 'duplicate_detection_alert'
      } }
    ],
    enabled: true,
    priority: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sla-reminder',
    name: 'SLA Reminder System',
    description: 'Send reminders for issues approaching SLA deadline',
    conditions: [
      { field: 'status', operator: 'equals', value: 'pending' },
      { field: 'created_at', operator: 'less_than', value: 'sla_deadline' } // Custom logic needed
    ],
    actions: [
      { type: 'send_notification', parameters: { 
        recipients: ['assigned_department'],
        template: 'sla_reminder',
        priority: 'medium'
      } },
      { type: 'escalate', parameters: { level: 'supervisor' } }
    ],
    enabled: true,
    priority: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Workflow execution engine
export class WorkflowEngine {
  private rules: WorkflowRule[] = [];
  private executions: WorkflowExecution[] = [];

  constructor(rules: WorkflowRule[] = DEFAULT_WORKFLOW_RULES) {
    this.rules = rules.sort((a, b) => a.priority - b.priority);
  }

  // Process an issue through all applicable workflow rules
  async processIssue(issue: any): Promise<WorkflowExecution[]> {
    const executions: WorkflowExecution[] = [];
    
    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      
      if (this.evaluateConditions(rule.conditions, issue)) {
        const execution = await this.executeRule(rule, issue);
        executions.push(execution);
      }
    }
    
    return executions;
  }

  // Evaluate workflow conditions against an issue
  private evaluateConditions(conditions: WorkflowCondition[], issue: any): boolean {
    if (conditions.length === 0) return true;
    
    let result = this.evaluateCondition(conditions[0], issue);
    
    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(condition, issue);
      
      if (condition.logical_operator === 'OR') {
        result = result || conditionResult;
      } else {
        result = result && conditionResult;
      }
    }
    
    return result;
  }

  // Evaluate a single condition
  private evaluateCondition(condition: WorkflowCondition, issue: any): boolean {
    const fieldValue = this.getFieldValue(issue, condition.field);
    const expectedValue = condition.value;
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      case 'starts_with':
        return String(fieldValue).toLowerCase().startsWith(String(expectedValue).toLowerCase());
      case 'ends_with':
        return String(fieldValue).toLowerCase().endsWith(String(expectedValue).toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue);
      case 'less_than':
        return Number(fieldValue) < Number(expectedValue);
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue);
      default:
        return false;
    }
  }

  // Get field value from issue object (supports nested fields)
  private getFieldValue(issue: any, field: string): any {
    const fields = field.split('.');
    let value = issue;
    
    for (const f of fields) {
      if (value && typeof value === 'object' && f in value) {
        value = value[f];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  // Execute a workflow rule
  private async executeRule(rule: WorkflowRule, issue: any): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rule_id: rule.id,
      issue_id: issue.id,
      status: 'running',
      started_at: new Date().toISOString(),
      actions_executed: []
    };

    this.executions.push(execution);

    try {
      for (const action of rule.actions) {
        if (action.delay) {
          await this.delay(action.delay * 60 * 1000); // Convert minutes to milliseconds
        }
        
        await this.executeAction(action, issue);
        execution.actions_executed.push(action.type);
      }
      
      execution.status = 'completed';
      execution.completed_at = new Date().toISOString();
    } catch (error) {
      execution.status = 'failed';
      execution.error_message = error instanceof Error ? error.message : 'Unknown error';
      execution.completed_at = new Date().toISOString();
    }

    return execution;
  }

  // Execute a single workflow action
  private async executeAction(action: WorkflowAction, issue: any): Promise<void> {
    switch (action.type) {
      case 'assign_department':
        await this.assignDepartment(issue, action.parameters.department);
        break;
      case 'set_priority':
        await this.setPriority(issue, action.parameters.priority);
        break;
      case 'set_status':
        await this.setStatus(issue, action.parameters.status);
        break;
      case 'add_tag':
        await this.addTag(issue, action.parameters.tags);
        break;
      case 'send_notification':
        await this.sendNotification(issue, action.parameters);
        break;
      case 'escalate':
        await this.escalate(issue, action.parameters.level);
        break;
      case 'create_task':
        await this.createTask(issue, action.parameters);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Action implementations (these would integrate with your actual services)
  private async assignDepartment(issue: any, department: string): Promise<void> {
    console.log(`Assigning issue ${issue.id} to department: ${department}`);
    // In a real implementation, this would update the database
  }

  private async setPriority(issue: any, priority: string): Promise<void> {
    console.log(`Setting priority for issue ${issue.id} to: ${priority}`);
    // In a real implementation, this would update the database
  }

  private async setStatus(issue: any, status: string): Promise<void> {
    console.log(`Setting status for issue ${issue.id} to: ${status}`);
    // In a real implementation, this would update the database
  }

  private async addTag(issue: any, tags: string[]): Promise<void> {
    console.log(`Adding tags to issue ${issue.id}: ${tags.join(', ')}`);
    // In a real implementation, this would update the database
  }

  private async sendNotification(issue: any, parameters: any): Promise<void> {
    console.log(`Sending notification for issue ${issue.id}:`, parameters);
    // In a real implementation, this would send actual notifications
  }

  private async escalate(issue: any, level: string): Promise<void> {
    console.log(`Escalating issue ${issue.id} to level: ${level}`);
    // In a real implementation, this would escalate the issue
  }

  private async createTask(issue: any, parameters: any): Promise<void> {
    console.log(`Creating task for issue ${issue.id}:`, parameters);
    // In a real implementation, this would create a task
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get workflow executions for an issue
  getExecutionsForIssue(issueId: string): WorkflowExecution[] {
    return this.executions.filter(exec => exec.issue_id === issueId);
  }

  // Get all workflow executions
  getAllExecutions(): WorkflowExecution[] {
    return this.executions;
  }

  // Add a new workflow rule
  addRule(rule: WorkflowRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  // Update a workflow rule
  updateRule(ruleId: string, updates: Partial<WorkflowRule>): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates, updated_at: new Date().toISOString() };
      return true;
    }
    return false;
  }

  // Delete a workflow rule
  deleteRule(ruleId: string): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId);
    if (index !== -1) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get all workflow rules
  getRules(): WorkflowRule[] {
    return this.rules;
  }
}

// Global workflow engine instance
export const workflowEngine = new WorkflowEngine();

// Utility functions for common workflow patterns
export function createSLAWorkflow(slaHours: number): WorkflowRule {
  return {
    id: `sla-${slaHours}h`,
    name: `SLA ${slaHours} Hour Reminder`,
    description: `Send reminder for issues approaching ${slaHours} hour SLA`,
    conditions: [
      { field: 'status', operator: 'equals', value: 'pending' },
      { field: 'created_at', operator: 'less_than', value: `-${slaHours - 1}h` }
    ],
    actions: [
      { type: 'send_notification', parameters: { 
        recipients: ['assigned_department'],
        template: 'sla_reminder',
        priority: 'high'
      } }
    ],
    enabled: true,
    priority: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export function createCategoryAssignmentWorkflow(category: string, department: string): WorkflowRule {
  return {
    id: `auto-assign-${category}`,
    name: `Auto-assign ${category} issues`,
    description: `Automatically assign ${category} issues to ${department}`,
    conditions: [
      { field: 'category', operator: 'equals', value: category }
    ],
    actions: [
      { type: 'assign_department', parameters: { department } },
      { type: 'add_tag', parameters: { tags: ['auto-assigned', category] } }
    ],
    enabled: true,
    priority: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
