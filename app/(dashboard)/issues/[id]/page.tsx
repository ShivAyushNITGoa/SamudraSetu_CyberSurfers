'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Report, ReportComment } from '@/lib/database';
import { getReportById, getCommentsByReportId, addCommentToReport, updateReportStatus } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import { 
  MapPin, 
  Calendar, 
  User, 
  Mail, 
  MessageSquare, 
  Image as ImageIcon,
  ArrowLeft,
  Edit,
  Save
} from 'lucide-react';
import SimpleMap from '@/components/SimpleMap';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';

function AuditTrail({ reportId }: { reportId: string }) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('audit_logs')
        .select('id, action, old_values, new_values, created_at, user_id')
        .eq('table_name', 'reports')
        .eq('record_id', reportId)
        .order('created_at', { ascending: false })
      setLogs(data || [])
      setLoading(false)
    }
    load()
  }, [reportId])

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading audit trail...</div>

  return (
    <div className="space-y-3 p-4">
      {logs.length === 0 && (
        <div className="text-sm text-gray-500">No audit entries yet.</div>
      )}
      {logs.map((l) => (
        <div key={l.id} className="border rounded p-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span className="font-medium">{l.action}</span>
            <span>{new Date(l.created_at).toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            <pre className="bg-gray-50 p-2 rounded overflow-x-auto">{JSON.stringify(l.old_values, null, 2)}</pre>
            <pre className="bg-gray-50 p-2 rounded overflow-x-auto">{JSON.stringify(l.new_values, null, 2)}</pre>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function IssueDetailsPage() {
  const params = useParams();
  const issueId = params.id as string;
  
  const [issue, setIssue] = useState<Report | null>(null);
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (issueId) {
      loadIssueDetails();
    } else {
      // If no issue id is present, stop loading and show not found state
      setLoading(false);
      setIssue(null);
    }
  }, [issueId]);

  const loadIssueDetails = async () => {
    try {
      setLoading(true);
      if (!issueId || typeof issueId !== 'string') {
        throw new Error('Invalid issue id');
      }
      const [issueData, commentsData] = await Promise.all([
        getReportById(issueId),
        getCommentsByReportId(issueId)
      ]);
      setIssue(issueData);
      setComments(commentsData);
      setAdminNotes(issueData.admin_notes || '');
    } catch (error) {
      console.error('Error loading issue details:', error);
      toast.error('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsAddingComment(true);
      if (!issueId) throw new Error('Missing issue id');
      await addCommentToReport(issueId, '00000000-0000-0000-0000-000000000001', newComment); // Using a default user ID
      setNewComment('');
      loadIssueDetails(); // Reload to get updated comments
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleStatusChange = async (status: Report['status']) => {
    console.log('Status change clicked:', { issueId, status, adminNotes });
    try {
      if (!issueId) throw new Error('Missing issue id');
      await updateReportStatus(issueId, status, adminNotes);
      setIssue(prev => prev ? { ...prev, status } : null);
      toast.success(`Issue status updated to ${status.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update issue status: ' + (error as Error).message);
    }
  };

  const handleSaveNotes = async () => {
    try {
      if (!issueId) throw new Error('Missing issue id');
      await updateReportStatus(issueId, issue?.status || 'unverified', adminNotes);
      setIsEditing(false);
      toast.success('Admin notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save admin notes');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Issue not found</h2>
          <Link href="/issues" className="btn btn-primary">
            Back to Issues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/issues" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Details */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.status)}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(issue.severity)}`}>
                    {issue.severity}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {issue.status === 'unverified' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('verified')}
                        className="btn btn-primary text-sm"
                      >
                        Start Work
                      </button>
                      <button
                        onClick={() => handleStatusChange('resolved')}
                        className="btn btn-success text-sm"
                      >
                        Mark Resolved
                      </button>
                    </>
                  )}
                  {issue.status === 'verified' && (
                    <button
                      onClick={() => handleStatusChange('resolved')}
                      className="btn btn-success text-sm"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-6">{issue.description}</p>

              {/* Media */}
              {issue.media_urls && issue.media_urls.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Media</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {issue.media_urls.map((url, index) => {
                      const lower = url.toLowerCase()
                      const isVideo = lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.includes('video')
                      return (
                        <div key={index} className="relative group">
                          {isVideo ? (
                            <video
                              controls
                              className="w-full h-40 object-cover rounded-lg shadow-sm"
                              src={url}
                            />
                          ) : (
                            <a href={url} target="_blank" rel="noopener noreferrer" title="Open full image">
                              <img
                                src={url}
                                alt={`Issue media ${index + 1}`}
                                className="w-full h-40 object-cover rounded-lg shadow-sm"
                                loading="lazy"
                              />
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>
                      {(Number.isFinite((issue as any)?.location?.latitude) && Number.isFinite((issue as any)?.location?.longitude))
                        ? `${(issue as any).location.latitude}, ${(issue as any).location.longitude}${issue.address ? ` - ${issue.address}` : ''}`
                        : (issue.address ? `Location not available - ${issue.address}` : 'Location not available')
                      }
                    </span>
                  </div>
                  
                  {/* Map */}
                  {Number.isFinite((issue as any)?.location?.latitude) && Number.isFinite((issue as any)?.location?.longitude) && (
                    <SimpleMap
                      center={[issue.location.latitude as any, issue.location.longitude as any]}
                      markers={[{
                        position: [issue.location.latitude as any, issue.location.longitude as any],
                        popup: `${issue.title} - ${issue.status}`
                      }]}
                      height="300px"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
              
              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 input"
                    disabled={isAddingComment}
                  />
                  <button
                    type="submit"
                    disabled={isAddingComment || !newComment.trim()}
                    className="btn btn-primary"
                  >
                    {isAddingComment ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {comment.user_name || 'Unknown User'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.comment}</p>
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No comments yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporter</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>{(issue as any).reporter_name || 'Unknown'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{(issue as any).reporter_email || 'Unknown'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{format(new Date(issue.created_at), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Admin Notes</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-700"
                    aria-label="Edit admin notes"
                    title="Edit admin notes"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full input"
                    rows={4}
                    placeholder="Add admin notes..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveNotes}
                      className="btn btn-primary text-sm"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700">
                  {adminNotes || 'No admin notes added yet.'}
                </p>
              )}
            </div>

            {/* Audit Trail */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Trail</h3>
              <AuditTrail reportId={issueId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
