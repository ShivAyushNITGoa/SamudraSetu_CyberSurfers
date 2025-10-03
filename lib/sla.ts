import { Report } from './database'

export interface SlaPolicy {
  category: string
  priority: Report['priority']
  hours: number
}

export const DEFAULT_SLA_POLICIES: SlaPolicy[] = [
  { category: 'safety', priority: 'urgent', hours: 4 },
  { category: 'infrastructure', priority: 'high', hours: 48 },
  { category: 'environment', priority: 'medium', hours: 72 },
  { category: 'utilities', priority: 'high', hours: 24 },
]

export function computeSla(issue: Report, policies: SlaPolicy[] = DEFAULT_SLA_POLICIES) {
  const policy = policies.find(p => p.category === issue.category && p.priority === issue.priority)
  if (!policy) return null
  const created = new Date(issue.created_at).getTime()
  const deadline = created + policy.hours * 3600 * 1000
  const now = Date.now()
  const remainingMs = Math.max(0, deadline - now)
  const breached = now > deadline && (!issue.resolved_at || new Date(issue.resolved_at).getTime() > deadline)
  return {
    deadline: new Date(deadline).toISOString(),
    remainingMs,
    breached,
  }
}


