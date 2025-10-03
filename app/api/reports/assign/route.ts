import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { issueId, departmentId, adminNotes } = body || {}
    if (!issueId || !departmentId) {
      return NextResponse.json({ error: 'Missing issueId or departmentId' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase server credentials not configured' }, { status: 500 })
    }

    const serverClient = createClient(url, serviceKey, { auth: { persistSession: false } })

    // Fetch department info (optional, to enrich admin notes)
    const { data: dept, error: deptErr } = await serverClient
      .from('departments')
      .select('name, contact_email')
      .eq('id', departmentId)
      .maybeSingle()

    if (deptErr) {
      // Not fatal, proceed without department details
      console.warn('Department fetch error:', deptErr)
    }

    const departmentName = dept?.name || 'Unknown Department'

    const updateData: any = {
      status: 'in_progress',
      assigned_to: departmentId,
      updated_at: new Date().toISOString(),
      admin_notes: adminNotes
        ? `${adminNotes}\n\nAssigned to: ${departmentName}`
        : `Assigned to: ${departmentName}`
    }

    const { data, error } = await serverClient
      .from('ocean_hazard_reports')
      .update(updateData)
      .eq('id', issueId)
      .select()
      .maybeSingle()

    if (error) {
      // Fallback upsert
      const { data: upsertData, error: upsertErr } = await serverClient
        .from('ocean_hazard_reports')
        .upsert([{ id: issueId, ...updateData }])
        .select()
        .maybeSingle()
      if (upsertErr) {
        return NextResponse.json({ error: upsertErr.message }, { status: 500 })
      }

      // Best-effort audit log
      await serverClient.from('audit_logs').insert({
        table_name: 'reports',
        record_id: issueId,
        action: 'assign_department',
        old_values: null,
        new_values: updateData,
        user_id: null
      })

      return NextResponse.json({ ok: true, report: upsertData })
    }

    // Best-effort audit log
    await serverClient.from('audit_logs').insert({
      table_name: 'reports',
      record_id: issueId,
      action: 'assign_department',
      old_values: null,
      new_values: updateData,
      user_id: null
    })

    return NextResponse.json({ ok: true, report: data })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}


