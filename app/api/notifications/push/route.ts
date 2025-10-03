import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, message } = body

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'User ID, title, and message are required' },
        { status: 400 }
      )
    }

    // Get user's FCM tokens
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_fcm_tokens')
      .select('token')
      .eq('user_id', userId)
      .eq('active', true)

    if (tokensError) {
      console.error('Error fetching FCM tokens:', tokensError)
      return NextResponse.json(
        { error: 'Failed to fetch user tokens' },
        { status: 500 }
      )
    }

    if (!userTokens || userTokens.length === 0) {
      return NextResponse.json(
        { error: 'No active FCM tokens found for user' },
        { status: 404 }
      )
    }

    // Firebase Cloud Messaging integration
    const serverKey = process.env.FIREBASE_SERVER_KEY

    if (!serverKey) {
      return NextResponse.json(
        { error: 'Firebase server key not configured' },
        { status: 500 }
      )
    }

    const results = []

    for (const tokenData of userTokens) {
      try {
        const fcmMessage = {
          to: tokenData.token,
          notification: {
            title: title,
            body: message,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            sound: 'default',
            click_action: '/citizen/alerts'
          },
          data: {
            type: 'hazard_alert',
            timestamp: new Date().toISOString(),
            userId: userId
          },
          priority: 'high',
          time_to_live: 3600 // 1 hour
        }

        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${serverKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fcmMessage)
        })

        const result = await response.json()

        if (response.ok) {
          results.push({
            token: tokenData.token,
            success: true,
            messageId: result.message_id
          })
        } else {
          console.error('FCM error for token:', tokenData.token, result)
          results.push({
            token: tokenData.token,
            success: false,
            error: result.error
          })

          // If token is invalid, mark it as inactive
          if (result.error === 'InvalidRegistration' || result.error === 'NotRegistered') {
            await supabase
              .from('user_fcm_tokens')
              .update({ active: false })
              .eq('token', tokenData.token)
          }
        }
      } catch (error) {
        console.error('Error sending FCM to token:', tokenData.token, error)
        results.push({
          token: tokenData.token,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: successCount > 0,
      results: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      },
      details: results
    })

  } catch (error) {
    console.error('Error sending push notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
