'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCitizenReportById, CitizenReport, getReportComments, addReportComment, ReportComment, isSubscribed, subscribeToReport, unsubscribeFromReport } from '@/lib/citizen-queries'
import { ArrowLeft, MapPin, Clock, User, MessageSquare, Share2, Flag, ThumbsUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/components/AuthProvider'

export default function IssueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [issue, setIssue] = useState<CitizenReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<ReportComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  // Upvote functionality removed - not available in new schema
  const [subscribed, setSubscribed] = useState<boolean>(false)

  useEffect(() => {
    if (params.id) {
      loadIssue(params.id as string)
    }
  }, [params.id])

  const loadIssue = async (issueId: string) => {
    setLoading(true)
    try {
      const foundIssue = await getCitizenReportById(issueId)
      if (foundIssue) {
        setIssue(foundIssue)
        const loadedComments = await getReportComments(issueId)
        setComments(loadedComments)
        if (user?.id) {
          const sub = await isSubscribed(issueId, user.id)
          setSubscribed(sub)
        }
      } else {
        toast.error('Issue not found')
        router.push('/citizen')
      }
    } catch (error) {
      console.error('Error loading issue:', error)
      toast.error('Failed to load issue details')
    } finally {
      setLoading(false)
    }
  }
  const handleAddComment = async () => {
    if (!issue) return
    const content = newComment.trim()
    if (!content) {
      toast.error('Comment cannot be empty')
      return
    }
    setPostingComment(true)
    try {
      // We may not have a user context here; try to read from local auth provider if exists
      if (!user?.id) {
        toast.error('Please sign in to comment')
        return
      }
      const userId = user.id
      const created = await addReportComment({
        reportId: issue.id,
        userId,
        userName: user.user_metadata?.name || user.email || 'User',
        comment: content,
      })
      setComments((prev) => [...prev, created])
      setNewComment('')
      toast.success('Comment added')
    } catch (error) {
      console.error(error)
      toast.error('Failed to add comment')
    } finally {
      setPostingComment(false)
    }
  }

  // Upvote functionality removed - not available in new schema

  const handleToggleSubscribe = async () => {
    if (!issue) return
    if (!user?.id) { toast.error('Please sign in to subscribe'); return }
    try {
      if (subscribed) {
        await unsubscribeFromReport(issue.id, user.id)
        setSubscribed(false)
        toast.success('Unsubscribed')
      } else {
        await subscribeToReport(issue.id, user.id)
        setSubscribed(true)
        toast.success('Subscribed for updates')
      }
    } catch (e) {
      toast.error('Subscription failed')
    }
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'in_progress': return 'In Progress'
      case 'resolved': return 'Resolved'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      infrastructure: 'Infrastructure',
      environment: 'Environment',
      safety: 'Public Safety',
      transport: 'Transport',
      utilities: 'Utilities',
      other: 'Other'
    }
    return categoryMap[category] || category
  }

  const handleShare = async () => {
    if (navigator.share && issue) {
      try {
        await navigator.share({
          title: issue.title,
          text: issue.description,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Issue not found</h2>
          <p className="text-gray-600 mb-4">The issue you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/citizen')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Issues
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Issue Details</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Share issue"
                aria-label="Share issue"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button 
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Report issue"
                aria-label="Report issue"
              >
                <Flag className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Issue Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-3">{issue.title}</h2>
          <p className="text-gray-600 mb-4">{issue.description}</p>
          
          {/* Status and Category */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getCategoryLabel(issue.hazard_type)}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.severity)}`}>
              {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
              {getStatusLabel(issue.status)}
            </span>
          </div>

          {/* Location and Time */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{issue.address || 'Location not specified'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>
                Reported {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
              </span>
            </div>
            {issue.reporter_name && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>Reported by {issue.reporter_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Images */}
        {issue.media_urls && issue.media_urls.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
            <div className="grid grid-cols-1 gap-3">
              {issue.media_urls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Issue photo ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Map */}
        {issue.latitude && issue.longitude && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
            <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive map coming soon</p>
                <p className="text-sm text-gray-500">
                  Coordinates: {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
          </div>
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No comments yet</p>
                <p className="text-sm text-gray-500">Be the first to comment on this issue</p>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-800">{c.user_name || 'User'}</div>
                    <div className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{c.comment}</p>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAddComment}
              disabled={postingComment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {postingComment ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Upvote functionality removed - not available in new schema */}
          <button
            onClick={handleToggleSubscribe}
            className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${subscribed ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {subscribed ? 'Subscribed to updates' : 'Subscribe to updates'}
          </button>
          <button onClick={handleShare} className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Share2 className="h-5 w-5 mr-2" />
            Share Issue
          </button>
        </div>
      </div>
    </div>
  )
}
