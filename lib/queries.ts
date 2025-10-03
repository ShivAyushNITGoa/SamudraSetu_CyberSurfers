// @ts-nocheck
import { supabase } from './supabase'
import { getTableStructure } from './database-info'
import { createClient } from '@supabase/supabase-js'
import { Report, ReportComment, Profile, Department } from './database'

// Test database connection
export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('ocean_hazard_reports')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Database connection test failed:', error)
      return false
    }
    
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.error('Database connection test error:', error)
    return false
  }
}

// Create sample data for testing
export const createSampleData = async () => {
  try {
    // First, create a sample profile if none exists
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    let profileId = existingProfiles?.[0]?.id

    if (!profileId) {
      // Create a sample profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        })
        .select()
        .single()

      if (profileError) {
        console.error('Error creating sample profile:', profileError)
        return false
      }
      profileId = newProfile.id
    }

    // Create sample reports
    const { data: existingReports } = await supabase
      .from('ocean_hazard_reports')
      .select('id')
      .limit(1)

    if (!existingReports?.length) {
      const sampleReports = [
        {
          title: 'Broken Street Light',
          description: 'Street light on Main Street is not working, making it dangerous for pedestrians at night.',
          hazard_type: 'coastal_damage',
          severity: 'medium',
          status: 'pending',
          location: JSON.stringify({ latitude: 15.4989, longitude: 73.8278 }),
          address: 'Main Street, Panaji, Goa',
          media_urls: [],
          user_id: profileId,
          admin_notes: null
        },
        {
          title: 'Pothole on Highway',
          description: 'Large pothole on NH66 causing traffic issues and vehicle damage.',
          hazard_type: 'coastal_damage',
          severity: 'high',
          status: 'in_progress',
          location: JSON.stringify({ latitude: 15.5000, longitude: 73.8300 }),
          address: 'NH66, Near Panaji, Goa',
          media_urls: [],
          user_id: profileId,
          admin_notes: 'Work started, expected completion in 2 weeks'
        },
        {
          title: 'Garbage Collection Issue',
          description: 'Garbage not being collected regularly in residential area.',
          hazard_type: 'marine_pollution',
          severity: 'medium',
          status: 'resolved',
          location: JSON.stringify({ latitude: 15.4900, longitude: 73.8200 }),
          address: 'Residential Area, Panaji, Goa',
          media_urls: [],
          user_id: profileId,
          admin_notes: 'Issue resolved, regular collection schedule restored',
          resolved_at: new Date().toISOString()
        }
      ]

      const { error: reportsError } = await supabase
        .from('ocean_hazard_reports')
        .insert(sampleReports)

      if (reportsError) {
        console.error('Error creating sample reports:', reportsError)
        return false
      }

      console.log('Sample data created successfully')
    }

    return true
  } catch (error) {
    console.error('Error creating sample data:', error)
    return false
  }
}

// Reports queries
export const getAllReports = async (): Promise<Report[]> => {
  try {
    // First try with join
    const { data, error } = await supabase
      .from('ocean_hazard_reports')
      .select(`
        *,
        profiles (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Join query failed, trying simple query:', error)
      // Fallback to simple query
      const { data: simpleData, error: simpleError } = await supabase
        .from('ocean_hazard_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (simpleError) {
        console.error('Simple query also failed, attempting civic_issues fallback:', simpleError)
        // FINAL FALLBACK: civic_issues table (new schema)
        const { data: civicIssues, error: civicError } = await supabase
          .from('civic_issues')
          .select('*')
          .order('created_at', { ascending: false })

        if (civicError) {
          console.error('civic_issues fallback failed:', civicError)
          throw civicError
        }

        return (civicIssues || []).map(mapCivicIssueToReport)
      }

      // Get user profiles separately
      const userIds = [...new Set(simpleData?.map(r => r.user_id) || [])]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds)

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

      return simpleData?.map(report => ({
        ...report,
        reporter_id: report.user_id,
        reporter_name: profileMap.get(report.user_id)?.name || 'Unknown',
        reporter_email: profileMap.get(report.user_id)?.email || '',
        images: report.media_urls || [],
        location: normalizeLocation(report.location)
      })) || []
    }
    
    // Transform the data to match our interface
    // If reports data not present but civic_issues exists
    if (!data || data.length === 0) {
      const { data: civicIssues } = await supabase
        .from('civic_issues')
        .select('*')
        .order('created_at', { ascending: false })
      return (civicIssues || []).map(mapCivicIssueToReport)
    }

    return data?.map(report => ({
      ...report,
      reporter_id: report.user_id,
      reporter_name: report.profiles?.name || 'Unknown',
      reporter_email: report.profiles?.email || '',
      images: report.media_urls || [],
      location: normalizeLocation(report.location)
    })) || []
  } catch (error) {
    console.error('Error fetching reports:', error)
    throw error
  }
}

// Lightweight, paginated reports query for faster initial loads
export const getReportsPage = async (
  limit: number = 20,
  offset: number = 0
): Promise<Report[]> => {
  try {
    // Select only necessary columns, avoid joins for speed
    const { data, error } = await supabase
      .from('ocean_hazard_reports')
      .select(
        'id, title, description, hazard_type, severity, status, location, address, media_urls, user_id, verified_by, created_at, updated_at, verified_at'
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + Math.max(0, limit - 1))

    if (error) {
      console.warn('getReportsPage failed on reports, attempting civic_issues:', error)
      const { data: civicIssues, error: civicError } = await supabase
        .from('civic_issues')
        .select(
          'id, title, description, hazard_type, severity, status, location, address, images, reporter_id, verified_by, created_at, updated_at, verified_at'
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + Math.max(0, limit - 1))

      if (civicError) throw civicError
      return (civicIssues || []).map(mapCivicIssueToReport)
    }

    const rows = data || []

    return rows.map((report: any) => ({
      ...report,
      reporter_id: report.user_id,
      reporter_name: (report as any).reporter_name || 'Unknown',
      reporter_email: (report as any).reporter_email || '',
      images: report.media_urls || [],
      location: normalizeLocation(report.location)
    }))
  } catch (error) {
    console.error('Error in getReportsPage:', error)
    throw error
  }
}

export const getReportById = async (id: string): Promise<Report> => {
  try {
    // Try primary reports table first
    const { data, error } = await supabase
      .from('ocean_hazard_reports')
      .select(`
        *,
        profiles (
          id,
          name,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (!error && data) {
      return {
        ...data,
        reporter_id: data.user_id,
        reporter_name: data.profiles?.name || 'Unknown',
        reporter_email: data.profiles?.email || '',
        images: data.media_urls || [],
        location: normalizeLocation((data as any).location)
      }
    }

    // Fallback 1: simple reports select without join (RLS-friendly)
    const { data: simpleReport, error: simpleErr } = await supabase
      .from('ocean_hazard_reports')
      .select('*')
      .eq('id', id)
      .single()

    if (!simpleErr && simpleReport) {
      return {
        ...simpleReport,
        reporter_id: simpleReport.user_id,
        reporter_name: (simpleReport as any).reporter_name || 'Unknown',
        reporter_email: (simpleReport as any).reporter_email || '',
        images: (simpleReport as any).media_urls || [],
        location: normalizeLocation((simpleReport as any).location)
      } as any
    }

    // Fallback 2: new civic_issues schema
    console.warn('getReportById falling back to civic_issues due to error or missing data:', error || simpleErr)
    const { data: civic, error: civicError } = await supabase
      .from('civic_issues')
      .select('*')
      .eq('id', id)
      .single()

    if (!civicError && civic) {
      // Map civic_issues row to Report shape
      return mapCivicIssueToReport(civic)
    }

    // Final fallback: return a minimal placeholder to allow UI to render instead of throwing
    console.error('All getReportById lookups failed:', error, simpleErr, civicError)
    return {
      id,
      title: 'Issue unavailable',
      description: 'Unable to load this issue from the database.',
      hazard_type: 'other',
      severity: 'medium',
      status: 'pending',
      location: { latitude: 0, longitude: 0 },
      address: '',
      media_urls: [],
      user_id: 'unknown',
      assigned_to: null as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: null as any,
      admin_notes: null as any,
    } as unknown as Report
  } catch (e: any) {
    const msg = String(e?.message || e)
    if (msg.includes('Supabase not configured') || msg.includes('Failed to fetch')) {
      // Return a minimal mock so UI can render in demo mode
      return {
        id,
        title: 'Demo Issue',
        description: 'Supabase not configured. Showing demo data.',
        hazard_type: 'coastal_damage',
        severity: 'medium',
        status: 'pending',
        location: { latitude: 15.4989, longitude: 73.8278 },
        address: 'Panaji, Goa',
        media_urls: [],
        user_id: 'demo-user',
        assigned_to: null as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        resolved_at: null as any,
        admin_notes: 'Demo mode',
      } as unknown as Report
    }
    throw e
  }
}

let cachedHasAdminNotes: boolean | null = null
async function hasAdminNotesColumn(): Promise<boolean> {
  if (cachedHasAdminNotes !== null) return cachedHasAdminNotes
  try {
    const cols = await getTableStructure('ocean_hazard_reports')
    cachedHasAdminNotes = Array.isArray(cols) && cols.some((c: any) => c.column_name === 'admin_notes')
    return cachedHasAdminNotes
  } catch {
    cachedHasAdminNotes = false
    return false
  }
}

export const updateReportStatus = async (id: string, status: Report['status'], adminNotes?: string) => {
  // Import the workaround function
  const { updateReportStatusSimple } = await import('./status-update-workaround')
  
  try {
    // Use the simple workaround that avoids RLS recursion
    const updated = await updateReportStatusSimple(id, status, adminNotes)
    // Best-effort audit log
    await addAuditLog('reports', id, 'update_status', null, { status, admin_notes: adminNotes })
    return updated
  } catch (error) {
    console.error('Workaround method failed, trying fallback:', error)
    
    // Fallback: Try the original method with better error handling
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    }
    
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString()
    } else {
      updateData.resolved_at = null
    }
    
    if (adminNotes !== undefined && await hasAdminNotesColumn()) {
      updateData.admin_notes = adminNotes
    }

    console.log('Updating report status (fallback):', { id, status, updateData })

    const { data, error: fallbackError } = await supabase
      .from('ocean_hazard_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (fallbackError) {
      console.error('Fallback update failed:', fallbackError)
      throw new Error(`Failed to update issue status: ${fallbackError.message}`)
    }
    
    // Best-effort audit log
    await addAuditLog('reports', id, 'update_status', null, updateData)
    console.log('Report status updated successfully (fallback):', data)
    return data
  }
}

export const getReportsByStatus = async (status: Report['status']): Promise<Report[]> => {
  const { data, error } = await supabase
        .from('ocean_hazard_reports')
    .select(`
      *,
      profiles (
        id,
        name,
        email
      )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reports by status:', error)
    throw error
  }
  
  return data?.map(report => ({
    ...report,
    reporter_id: report.user_id,
    reporter_name: report.profiles?.name || 'Unknown',
    reporter_email: report.profiles?.email || '',
    images: report.media_urls || [],
    location: normalizeLocation(report.location)
  })) || []
}

export const getReportsStats = async () => {
  const { data, error } = await supabase
        .from('ocean_hazard_reports')
    .select('status, hazard_type, severity, created_at')

  if (error) {
    console.warn('getReportsStats failed on reports, attempting civic_issues:', error)
    // civic_issues fallback with compatible fields
    const { data: civicIssues, error: civicError } = await supabase
      .from('civic_issues')
      .select('status, hazard_type, severity, created_at')
    if (civicError) throw civicError
    return aggregateStatsFromAny(civicIssues || [])
  }

  const allReports = data || []

  const total = allReports.length
  const pending = allReports.filter(r => r.status === 'pending').length
  const inProgress = allReports.filter(r => r.status === 'in_progress').length
  const resolved = allReports.filter(r => r.status === 'resolved').length
  const closed = allReports.filter(r => r.status === 'closed').length

  const byStatus = Object.entries(
    allReports.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({ status, count }))

  const byHazardType = Object.entries(
    allReports.reduce((acc, r) => {
      acc[r.hazard_type] = (acc[r.hazard_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([hazard_type, count]) => ({ hazard_type, count }))

  const bySeverity = Object.entries(
    allReports.reduce((acc, r) => {
      acc[r.severity] = (acc[r.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([severity, count]) => ({ severity, count }))

  // For recent, count reports created in the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recent = allReports.filter(r => new Date(r.created_at) > sevenDaysAgo).length

    return {
    total,
    pending,
    inProgress,
    resolved,
    closed,
    byStatus,
    byHazardType,
    bySeverity,
    recent,
  }
}

// -------- New helpers for new schema ---------

function mapCivicIssueToReport(row: any): any {
  // Map civic_issues columns to reports-like shape our UI expects
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    hazard_type: row.hazard_type,
    severity: row.severity,
    status: row.status || 'pending',
    location: normalizeLocation(row.location),
    address: row.address || '',
    media_urls: row.images || [],
    images: row.images || [],
    user_id: row.reporter_id,
    reporter_id: row.reporter_id,
    reporter_name: row.reporter_name || 'Unknown',
    reporter_email: row.reporter_email || '',
    assigned_to: row.assigned_to || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    resolved_at: row.resolved_at,
    admin_notes: row.admin_notes || null,
  }
}

function normalizeLocation(loc: any): { latitude: number; longitude: number } {
  try {
    if (!loc) return { latitude: 0, longitude: 0 }
    
    // Handle PostGIS POINT format: "POINT(lng lat)"
    if (typeof loc === 'string' && loc.startsWith('POINT(')) {
      const match = loc.match(/POINT\(([^)]+)\)/)
      if (match) {
        const coords = match[1].split(' ')
        const longitude = parseFloat(coords[0])
        const latitude = parseFloat(coords[1])
        if (isFinite(latitude) && isFinite(longitude)) {
          return { latitude, longitude }
        }
      }
    }
    
    const parsed = typeof loc === 'string' ? JSON.parse(loc) : loc
    
    // GeoJSON Point { type: 'Point', coordinates: [lng, lat] }
    if (parsed && Array.isArray(parsed.coordinates) && parsed.coordinates.length >= 2) {
      const lng = Number(parsed.coordinates[0])
      const lat = Number(parsed.coordinates[1])
      if (isFinite(lat) && isFinite(lng)) return { latitude: lat, longitude: lng }
    }
    // Already normalized
    const toNum = (v: any) => (typeof v === 'string' ? parseFloat(v) : v)
    if (parsed && (parsed.latitude !== undefined) && (parsed.longitude !== undefined)) {
      const lat = toNum(parsed.latitude)
      const lng = toNum(parsed.longitude)
      if (isFinite(lat) && isFinite(lng)) return { latitude: lat, longitude: lng }
    }
    // Some schemas use lat/lng keys
    if (parsed && (parsed.lat !== undefined) && (parsed.lng !== undefined)) {
      const lat = toNum(parsed.lat)
      const lng = toNum(parsed.lng)
      if (isFinite(lat) && isFinite(lng)) return { latitude: lat, longitude: lng }
    }
    return { latitude: 0, longitude: 0 }
  } catch {
    return { latitude: 0, longitude: 0 }
  }
}

function aggregateStatsFromAny(rows: any[]) {
  const all = rows || []
  const total = all.length
  const pending = all.filter(r => r.status === 'pending').length
  const inProgress = all.filter(r => r.status === 'in_progress').length
  const resolved = all.filter(r => r.status === 'resolved').length
  const closed = all.filter(r => r.status === 'closed').length

  const byStatus = Object.entries(
    all.reduce((acc: any, r: any) => {
      acc[r.status] = (acc[r.status] || 0) + 1
      return acc
    }, {})
  ).map(([status, count]) => ({ status, count }))

  const byHazardType = Object.entries(
    all.reduce((acc: any, r: any) => {
      acc[r.hazard_type] = (acc[r.hazard_type] || 0) + 1
      return acc
    }, {})
  ).map(([hazard_type, count]) => ({ hazard_type, count }))

  const bySeverity = Object.entries(
    all.reduce((acc: any, r: any) => {
      acc[r.severity] = (acc[r.severity] || 0) + 1
      return acc
    }, {})
  ).map(([severity, count]) => ({ severity, count }))

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recent = all.filter(r => new Date(r.created_at) > sevenDaysAgo).length

  return { total, pending, inProgress, resolved, closed, byStatus, byHazardType, bySeverity, recent }
}

// Audit logs
export async function addAuditLog(
  tableName: string,
  recordId: string,
  action: string,
  oldValues: any,
  newValues: any,
  userId?: string,
) {
  try {
    await supabase.from('audit_logs').insert({
      table_name: tableName,
      record_id: recordId,
      action,
      old_values: oldValues,
      new_values: newValues,
      user_id: userId || null,
    })
  } catch (e) {
    console.warn('Failed to write audit log (non-fatal):', e)
  }
}

// Upvotes helpers for reports/civic_issues
export async function addUpvote(reportId: string, userId: string) {
  const { error } = await supabase.from('upvotes').insert({ report_id: reportId, user_id: userId })
  if (error) throw error
}

export async function removeUpvote(reportId: string, userId: string) {
  const { error } = await supabase.from('upvotes').delete().eq('report_id', reportId).eq('user_id', userId)
  if (error) throw error
}

export async function getUpvotesCount(reportId: string) {
  const { count, error } = await supabase.from('upvotes').select('*', { count: 'exact', head: true }).eq('report_id', reportId)
  if (error) throw error
  return count || 0
}

// Comments queries
export const getCommentsByReportId = async (reportId: string): Promise<ReportComment[]> => {
  try {
    const { data, error } = await supabase
      .from('report_comments')
      .select(`
        *,
        profiles (
          name
        )
      `)
      .eq('report_id', reportId)
      .order('created_at', { ascending: true })

    if (error) throw error
    
    return data?.map(comment => ({
      ...comment,
      user_name: comment.profiles?.name || 'Unknown'
    })) || []
  } catch (e: any) {
    const msg = String(e?.message || e)
    if (msg.includes('Supabase not configured') || msg.includes('Failed to fetch')) {
      return []
    }
    throw e
  }
}

export const addCommentToReport = async (reportId: string, userId: string, comment: string) => {
  const { data, error } = await supabase
    .from('report_comments')
    .insert({
      report_id: reportId,
      user_id: userId,
      comment
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getAllComments = async (): Promise<ReportComment[]> => {
  const { data, error } = await supabase
    .from('report_comments')
    .select(`
      *,
      profiles (
        name
      ),
      reports (
        title
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all comments:', error)
    throw error
  }
  
  return data?.map(comment => ({
    ...comment,
    user_name: comment.profiles?.name || 'Unknown',
    report_title: comment.reports?.title || 'Unknown Report'
  })) || []
}

// Profile queries
export const getProfile = async (userId: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Department queries
export const getAllDepartments = async (): Promise<Department[]> => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export const createDepartment = async (name: string, contact_email: string): Promise<Department> => {
  const { data, error } = await supabase
    .from('departments')
    .insert({ name, contact_email })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateDepartment = async (id: string, updates: Partial<Department>): Promise<Department> => {
  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteDepartment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Legacy functions for backward compatibility
export const getAllCivicIssues = getAllReports
export const getCivicIssueById = getReportById
export const updateCivicIssueStatus = updateReportStatus
export const getCivicIssuesByStatus = getReportsByStatus
export const getCivicIssuesStats = getReportsStats