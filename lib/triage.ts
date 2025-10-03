import { Report } from './database'

export interface TriageSuggestion {
  priority: Report['priority']
  suggestedDepartmentName?: string
  rationale: string
}

const keywordToPriority: Array<{ keywords: string[]; priority: Report['priority'] }> = [
  { keywords: ['accident', 'injury', 'fire', 'collapse', 'gas', 'electrocution'], priority: 'urgent' },
  { keywords: ['pothole', 'bridge', 'road broken', 'sewage', 'flood', 'waterlogging'], priority: 'high' },
  { keywords: ['garbage', 'trash', 'cleanliness', 'waste'], priority: 'medium' },
]

const departmentKeywordMap: Record<string, string[]> = {
  Police: ['theft', 'assault', 'harassment', 'crime'],
  Fire: ['fire', 'smoke', 'blast'],
  Electricity: ['electric', 'street light', 'transformer', 'wire'],
  Water: ['water', 'leak', 'sewage', 'drain', 'pipeline'],
  Roads: ['road', 'pothole', 'footpath', 'bridge', 'traffic'],
  Sanitation: ['garbage', 'trash', 'cleanliness', 'waste', 'bin'],
}

export function suggestTriage(issue: Pick<Report, 'title' | 'description' | 'category'>): TriageSuggestion {
  const text = `${issue.title} ${issue.description}`.toLowerCase()

  // Priority by keywords
  let priority: Report['priority'] = 'medium'
  for (const rule of keywordToPriority) {
    if (rule.keywords.some(k => text.includes(k))) {
      priority = rule.priority
      break
    }
  }
  // Category overrides
  if (issue.category === 'safety') priority = 'urgent'

  // Department by keywords
  let department: string | undefined
  for (const [dept, keys] of Object.entries(departmentKeywordMap)) {
    if (keys.some(k => text.includes(k))) {
      department = dept
      break
    }
  }

  const rationaleParts = [
    `Priority set to ${priority} based on detected keywords/category`,
    department ? `Department suggested: ${department}` : undefined,
  ].filter(Boolean)

  return {
    priority,
    suggestedDepartmentName: department,
    rationale: rationaleParts.join('. '),
  }
}


