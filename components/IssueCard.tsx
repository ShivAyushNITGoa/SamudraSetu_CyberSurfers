'use client'

import { useState, useEffect } from 'react'
import { Report, Department } from '@/lib/database'
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle, User, Calendar, Eye, Building2, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
// Fallback type if Next types are missing
const NextLink: any = Link as any
import { assignIssueToDepartment, hasDepartmentCompletion, reportDepartmentCompletion } from '@/lib/department-workflow'
import toast from 'react-hot-toast'
import { suggestTriage } from '@/lib/triage'
import { computeSla } from '@/lib/sla'

interface IssueCardProps {
  issue: Report
  onStatusChange: (id: string, status: Report['status']) => void
  onViewDetails: (id: string) => void
  departments?: Department[]
  onDepartmentAssigned?: () => void
  duplicates?: Report[]
  onMarkDuplicate?: (primaryId: string) => void
}

export default function IssueCard({ issue, onStatusChange, onViewDetails, departments = [], onDepartmentAssigned, duplicates = [], onMarkDuplicate }: IssueCardProps) {
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [assignmentNotes, setAssignmentNotes] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [hasCompletion, setHasCompletion] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completionNotes, setCompletionNotes] = useState('')
  const triage = suggestTriage({ title: issue.title, description: issue.description, category: issue.hazard_type as any })
  const sla = computeSla(issue)

  // Check if issue has department completion
  useEffect(() => {
    hasDepartmentCompletion(issue.id).then(setHasCompletion)
  }, [issue.id])

  const handleAssignToDepartment = async () => {
    if (!selectedDepartment) {
      toast.error('Please select a department')
      return
    }

    setIsAssigning(true)
    try {
      // Prefer server route with service role if available
      try {
        const res = await fetch('/api/reports/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ issueId: issue.id, departmentId: selectedDepartment, adminNotes: assignmentNotes })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({} as any))
          throw new Error(err?.error || `Assign failed (${res.status})`)
        }
      } catch (e) {
        // Fallback to client-side method
        await assignIssueToDepartment(issue.id, selectedDepartment, assignmentNotes)
      }
      toast.success('Issue assigned to department successfully')
      setShowDepartmentModal(false)
      setSelectedDepartment('')
      setAssignmentNotes('')
      onDepartmentAssigned?.()
    } catch (error) {
      console.error('Error assigning to department:', error)
      toast.error('Failed to assign issue to department')
    } finally {
      setIsAssigning(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {issue.title}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
              {getStatusIcon(issue.status)}
              <span className="ml-1">{issue.status.replace('_', ' ')}</span>
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.severity)}`}>
              {issue.severity}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {issue.description}
      </p>

      {/* Triage Suggestions */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {triage?.priority && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            Suggested priority: {triage.priority}
          </span>
        )}
        {triage?.suggestedDepartmentName && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            Route to: {triage.suggestedDepartmentName}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <User className="h-4 w-4 mr-2" />
          <span>{(issue as any).reporter_name || 'Unknown'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="truncate">{issue.address}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{format(new Date(issue.created_at), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Images indicator */}
      {issue.media_urls && issue.media_urls.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
              {issue.media_urls.length} image{issue.media_urls.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Department Assignment Status */}
      {issue.status === 'verified' && issue.assigned_to && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center text-sm text-blue-700">
            <Building2 className="h-4 w-4 mr-2" />
            <span>Assigned to Department</span>
            {sla && (
              <span className={`ml-3 text-xs px-2 py-0.5 rounded ${sla.breached ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {sla.breached ? 'SLA Breached' : 'SLA Healthy'}
              </span>
            )}
            {hasCompletion && (
              <div className="ml-auto flex items-center text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span className="text-xs">Department Completed</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Potential Duplicates */}
      {duplicates.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="text-sm text-amber-800 font-medium mb-2">Potential duplicates nearby</div>
          <ul className="text-sm text-amber-900 list-disc list-inside space-y-1">
            {duplicates.slice(0, 2).map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => onViewDetails(d.id)}
                  className="underline hover:no-underline"
                >
                  {d.title}
                </button>
                {onMarkDuplicate && (
                  <button
                    onClick={() => onMarkDuplicate(d.id)}
                    className="ml-3 text-xs px-2 py-0.5 bg-amber-100 text-amber-900 rounded hover:bg-amber-200"
                  >
                    Mark this as duplicate of above
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          {issue.status === 'unverified' && (
            <>
              <button
                onClick={() => setShowDepartmentModal(true)}
                className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors flex items-center"
              >
                <Building2 className="h-3 w-3 mr-1" />
                Assign to Dept
              </button>
              <button
                onClick={() => onStatusChange(issue.id, 'resolved')}
                className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
              >
                Resolve
              </button>
            </>
          )}
          {issue.status === 'verified' && hasCompletion && (
            <button
              onClick={() => onStatusChange(issue.id, 'resolved')}
              className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors flex items-center"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Resolve
            </button>
          )}
          {issue.status === 'verified' && !hasCompletion && (
            <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
              Waiting for Department
            </span>
          )}
          {issue.status === 'verified' && (
            <button
              onClick={() => setShowCompletionModal(true)}
              className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
            >
              Add Completion Report
            </button>
          )}
        </div>
        <Link
          href={`/issues/${issue.id}`}
          className="flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Link>
      </div>

      {/* Department Assignment Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign to Department
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Department
                </label>
                <select
                  id="department-select"
                  aria-label="Select Department"
                  value={selectedDepartment}
                  onChange={(e: any) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Notes (Optional)
                </label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e: any) => setAssignmentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any specific instructions for the department..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDepartmentModal(false)
                  setSelectedDepartment('')
                  setAssignmentNotes('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignToDepartment}
                disabled={isAssigning || !selectedDepartment}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAssigning ? 'Assigning...' : 'Assign to Department'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Department Completion Report
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={completionNotes}
                onChange={(e: any) => setCompletionNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Describe the completion details..."
              />
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCompletionModal(false)
                  setCompletionNotes('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await reportDepartmentCompletion(issue.id, (issue.assigned_to as any) || '', completionNotes)
                    toast.success('Completion report added')
                    setShowCompletionModal(false)
                    setCompletionNotes('')
                    setHasCompletion(true)
                  } catch (err) {
                    toast.error('Failed to add completion report')
                  }
                }}
                disabled={!completionNotes}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
