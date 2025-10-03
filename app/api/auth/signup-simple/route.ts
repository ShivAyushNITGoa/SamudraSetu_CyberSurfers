import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    const body = await req.json()
    const { email, password, name, phone, role = 'citizen' } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields: email, password, name' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // Step 1: Temporarily disable the trigger
    console.log('Disabling trigger...')
    const { error: triggerError } = await supabase.rpc('disable_trigger', {
      trigger_name: 'on_auth_user_created'
    })
    
    if (triggerError) {
      console.log('Could not disable trigger (might not exist):', triggerError.message)
    }

    // Step 2: Create user in auth.users
    console.log('Creating auth user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone: phone || null
        }
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Step 3: Create profile manually
    console.log('Creating profile...')
    const profilePayload = {
      id: authData.user.id,
      email,
      name,
      role,
      phone: phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert(profilePayload)
      .select('*')
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json({ 
        error: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code
      }, { status: 400 })
    }

    // Step 4: Re-enable the trigger
    console.log('Re-enabling trigger...')
    const { error: enableError } = await supabase.rpc('enable_trigger', {
      trigger_name: 'on_auth_user_created'
    })
    
    if (enableError) {
      console.log('Could not re-enable trigger:', enableError.message)
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed_at: authData.user.email_confirmed_at
      },
      profile: profileData
    })

  } catch (err: any) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to create user' }, { status: 500 })
  }
}
