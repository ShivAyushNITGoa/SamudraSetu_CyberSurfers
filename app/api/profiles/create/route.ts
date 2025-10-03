import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cache disabled for writes
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    const body = await req.json()
    const { id, email, name, role, phone, language_preference, location, address } = body || {}

    if (!id || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields: id, email, name' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const payload: any = {
      id,
      email,
      name,
      role: role || 'citizen',
    }

    if (typeof phone === 'string') payload.phone = phone
    if (typeof language_preference === 'string') payload.language_preference = language_preference
    if (typeof address === 'string') payload.address = address
    
    // Handle location - convert to PostGIS POINT format
    if (location && typeof location === 'object' && location.latitude && location.longitude) {
      // Use PostGIS ST_Point function to create geography POINT
      payload.location = `SRID=4326;POINT(${location.longitude} ${location.latitude})`
    }

    console.log('Creating profile with payload:', payload)

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single()

    if (error) {
      console.error('Profile creation error:', error)
      return NextResponse.json({ 
        error: error.message, 
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 400 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create profile' }, { status: 500 })
  }
}


