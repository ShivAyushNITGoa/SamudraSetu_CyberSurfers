'use client';

import { useEffect, useMemo, useState } from 'react';
import { ReportComment } from '@/lib/database';
import { addCommentToReport, getAllComments } from '@/lib/queries';
import { MessageSquare, User, Calendar, AlertTriangle, RefreshCw, Filter, SortAsc, SortDesc, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/components/AuthProvider';

export default function CommentsPage() {
  const { user } = useAuth()
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [reportFilter, setReportFilter] = useState('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [sortBy, setSortBy] = useState<'created_at' | 'user_name' | 'report_title'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await getAllComments();
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('')
    setReportFilter('')
    setStartDate('')
    setEndDate('')
    setSortBy('created_at')
    setSortDir('desc')
    setPage(1)
    setPageSize(10)
  }

  const filteredComments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const rid = reportFilter.trim()
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    let rows = comments.filter(c => {
      const matchesText = !term ||
        c.comment.toLowerCase().includes(term) ||
        (c as any).user_name?.toLowerCase().includes(term) ||
        ((c as any).report_title || '').toLowerCase().includes(term)

      const matchesReport = !rid || String(c.report_id) === rid

      const created = new Date(c.created_at)
      const matchesStart = !start || created >= start
      const matchesEnd = !end || created <= end

      return matchesText && matchesReport && matchesStart && matchesEnd
    })

    rows.sort((a: any, b: any) => {
      let va: any
      let vb: any
      if (sortBy === 'created_at') {
        va = new Date(a.created_at).getTime()
        vb = new Date(b.created_at).getTime()
      } else if (sortBy === 'user_name') {
        va = (a.user_name || '').toLowerCase()
        vb = (b.user_name || '').toLowerCase()
      } else {
        va = ((a as any).report_title || '').toLowerCase()
        vb = ((b as any).report_title || '').toLowerCase()
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return rows
  }, [comments, searchTerm, reportFilter, startDate, endDate, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(filteredComments.length / pageSize))
  const pagedComments = useMemo(() => {
    const startIdx = (page - 1) * pageSize
    return filteredComments.slice(startIdx, startIdx + pageSize)
  }, [filteredComments, page, pageSize])

  useEffect(() => {
    // keep page in bounds when filters change
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  const [replyForId, setReplyForId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const submitReply = async (reportId: string) => {
    if (!user) {
      toast.error('You must be signed in to reply')
      return
    }
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty')
      return
    }
    try {
      await addCommentToReport(reportId, user.id, replyText.trim())
      toast.success('Reply posted')
      setReplyText('')
      setReplyForId(null)
      await loadComments()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Failed to post reply')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" text="Loading comments..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Comments</h1>
              <div className="flex items-center space-x-3">
                <button
                  onClick={loadComments}
                  className="btn btn-ghost flex items-center"
                  aria-label="Refresh"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search comments, users, reports..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                    className="input pl-10 w-72"
                  />
                  <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Report ID</label>
                  <input
                    type="text"
                    value={reportFilter}
                    onChange={(e) => { setReportFilter(e.target.value); setPage(1) }}
                    className="input w-40"
                    placeholder="e.g. 123"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="start-date">Start date</label>
                  <input id="start-date" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1) }} className="input" aria-label="Start date" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="end-date">End date</label>
                  <input id="end-date" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1) }} className="input" aria-label="End date" />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sort by</label>
                  <div className="flex items-center gap-2">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="select" aria-label="Sort by">
                      <option value="created_at">Date</option>
                      <option value="user_name">User</option>
                      <option value="report_title">Report</option>
                    </select>
                    <button
                      onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                      className="btn btn-ghost"
                      aria-label="Toggle sort direction"
                      title="Toggle sort direction"
                    >
                      {sortDir === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Page size</label>
                  <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1) }} className="select w-28" aria-label="Page size">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="ml-auto">
                  <button className="btn btn-ghost text-gray-600 flex items-center" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" /> Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {pagedComments.map((comment) => (
                <div key={comment.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{comment.user_name || 'Unknown User'}</h4>
                        <p className="text-sm text-gray-500">{(comment as any).report_title || `Issue #${comment.report_id}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{comment.comment}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Link 
                        href={`/issues/${comment.report_id}`}
                        className="text-sm text-primary-600 hover:text-primary-700"
                        aria-label="View issue details"
                        title="View issue details"
                      >
                        View Issue
                      </Link>
                      <button 
                        className="text-sm text-gray-600 hover:text-gray-700"
                        aria-label="Reply to comment"
                        title="Reply to comment"
                        onClick={() => {
                          setReplyForId(replyForId === String(comment.id) ? null : String(comment.id))
                          setReplyText('')
                        }}
                      >
                        {replyForId === String(comment.id) ? 'Cancel' : 'Reply'}
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600"
                        aria-label="Reply to comment"
                        title="Reply to comment"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {replyForId === String(comment.id) && (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="input flex-1"
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => submitReply(String(comment.report_id))}
                      >
                        Post
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredComments.length === 0 && (
              <EmptyState
                icon={<MessageSquare className="h-12 w-12" />}
                title="No comments found"
                description={
                  searchTerm ? 'Try adjusting your search terms.' : 'No comments have been made yet.'
                }
              />
            )}

            {/* Pagination */}
            {filteredComments.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredComments.length)} of {filteredComments.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-ghost"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm">Page {page} / {totalPages}</span>
                  <button
                    className="btn btn-ghost"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
  );
}
