// Department workflow management using existing database structure
import { supabase } from './supabase'
import { createClient } from '@supabase/supabase-js'
import { addAuditLog } from './queries'
import { Report, Department } from './database'

// Assign issue to department and set status to in_progress
export const assignIssueToDepartment = async (
  issueId: string, 
  departmentId: string, 
  adminNotes?: string
): Promise<Report> => {
  try {
    // Get department info for admin notes
    const { data: department } = await supabase
      .from('departments')
      .select('name, contact_email')
      .eq('id', departmentId)
      .single()

    const departmentName = department?.name || 'Unknown Department'
    
    // Update the issue with department assignment
    const updateData: any = {
      status: 'in_progress',
      assigned_to: departmentId, // Store department ID in assigned_to field
      updated_at: new Date().toISOString()
    }

    // Add admin notes about department assignment
    if (adminNotes) {
      updateData.admin_notes = `${adminNotes}\n\nAssigned to: ${departmentName}`
    } else {
      updateData.admin_notes = `Assigned to: ${departmentName}`
    }

    // Primary path: use a dedicated simple client (avoids potential RLS recursion)
    const simpleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false }
      }
    )

    const { data, error } = await simpleClient
      .from('ocean_hazard_reports')
      .update(updateData)
      .eq('id', issueId)
      .select()
      .maybeSingle()

    if (error) {
      console.warn('Assignment update failed, trying fallback upsert:', error)
      const { data: upsertData, error: upsertErr } = await supabase
        .from('ocean_hazard_reports')
        .upsert([{ id: issueId, ...updateData }])
        .select()
        .maybeSingle()
      if (upsertErr) throw upsertErr
      await addAuditLog('reports', issueId, 'assign_department', null, updateData)
      console.log(`Issue ${issueId} assigned to department ${departmentName} (fallback upsert)`)
      return upsertData as any
    }

    await addAuditLog('reports', issueId, 'assign_department', null, updateData)
    console.log(`Issue ${issueId} assigned to department ${departmentName}`)
    return data as any
  } catch (error) {
    console.error('Error assigning issue to department:', error)
    throw error
  }
}

// Department reports completion (using comments system)
export const reportDepartmentCompletion = async (
  issueId: string,
  departmentId: string,
  completionNotes: string
): Promise<void> => {
  try {
    // Get department info
    const { data: department } = await supabase
      .from('departments')
      .select('name')
      .eq('id', departmentId)
      .single()

    const departmentName = department?.name || 'Unknown Department'

    // Add completion comment
    const { error: commentError } = await supabase
      .from('report_comments')
      .insert({
        report_id: issueId,
        user_id: departmentId, // Using department ID as user_id for tracking
        user_name: departmentName,
        comment: `🏁 DEPARTMENT COMPLETION REPORT:\n\n${completionNotes}\n\nStatus: Ready for admin review and resolution.`
      })

    if (commentError) throw commentError

    // Update admin notes to indicate department completion
    const { data: currentIssue } = await supabase
      .from('ocean_hazard_reports')
      .select('admin_notes')
      .eq('id', issueId)
      .single()

    const updatedNotes = currentIssue?.admin_notes 
      ? `${currentIssue.admin_notes}\n\n✅ Department ${departmentName} reports completion: ${completionNotes}`
      : `✅ Department ${departmentName} reports completion: ${completionNotes}`

    const { error: updateError } = await supabase
      .from('ocean_hazard_reports')
      .update({
        admin_notes: updatedNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId)
      .select()
      .maybeSingle()

    if (updateError) throw updateError

    console.log(`Department ${departmentName} reported completion for issue ${issueId}`)
  } catch (error) {
    console.error('Error reporting department completion:', error)
    throw error
  }
}

// Admin resolves issue after department completion
export const adminResolveIssue = async (
  issueId: string,
  resolutionNotes: string
): Promise<Report> => {
  try {
    const { data, error } = await supabase
      .from('ocean_hazard_reports')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        admin_notes: resolutionNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId)
      .select()
      .single()

    if (error) throw error

    console.log(`Issue ${issueId} resolved by admin`)
    return data
  } catch (error) {
    console.error('Error resolving issue:', error)
    throw error
  }
}

// Get issues assigned to a specific department
export const getIssuesForDepartment = async (departmentId: string): Promise<Report[]> => {
  try {
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
      .eq('assigned_to', departmentId)
      .in('status', ['in_progress'])
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(report => ({
      ...report,
      reporter_id: report.user_id,
      reporter_name: report.profiles?.name || 'Unknown',
      reporter_email: report.profiles?.email || '',
      images: report.media_urls || [],
      location: (() => {
        try {
          if (typeof report.location === 'string') {
            return JSON.parse(report.location)
          }
          return report.location || { latitude: 0, longitude: 0 }
        } catch (e) {
          console.warn('Failed to parse location:', report.location)
          return { latitude: 0, longitude: 0 }
        }
      })()
    })) || []
  } catch (error) {
    console.error('Error fetching issues for department:', error)
    throw error
  }
}

// Check if issue has department completion report
export const hasDepartmentCompletion = async (issueId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('report_comments')
      .select('id')
      .eq('report_id', issueId)
      .ilike('comment', '%DEPARTMENT COMPLETION REPORT%')
      .limit(1)

    if (error) throw error
    return (data?.length || 0) > 0
  } catch (error) {
    console.error('Error checking department completion:', error)
    return false
  }
}

// Get all departments for assignment dropdown
export const getDepartmentsForAssignment = async (): Promise<Department[]> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching departments:', error)
    throw error
  }
}
