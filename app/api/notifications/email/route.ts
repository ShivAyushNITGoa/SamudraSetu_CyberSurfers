import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, message } = body

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Email, subject, and message are required' },
        { status: 400 }
      )
    }

    // SendGrid Email integration
    const apiKey = process.env.SENDGRID_API_KEY
    const senderEmail = process.env.SENDGRID_SENDER_EMAIL

    if (!apiKey || !senderEmail) {
      return NextResponse.json(
        { error: 'SendGrid configuration missing' },
        { status: 500 }
      )
    }

    const emailData = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject
        }
      ],
      from: { email: senderEmail, name: 'SamudraSetu' },
      content: [
        {
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">SamudraSetu</h1>
                <p style="color: white; margin: 5px 0 0 0; font-size: 14px;">Ocean Hazard Alert System</p>
              </div>
              <div style="padding: 30px; background: #f8f9fa;">
                <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">${subject}</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <p style="color: #555; line-height: 1.6; margin: 0;">${message}</p>
                </div>
                <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">
                  <p style="margin: 0; color: #1976d2; font-size: 14px;">
                    <strong>Important:</strong> This is an automated alert from SamudraSetu. 
                    Please take appropriate action based on the severity of the hazard.
                  </p>
                </div>
              </div>
              <div style="background: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #666; font-size: 12px;">
                  © 2024 SamudraSetu. All rights reserved.
                </p>
                <p style="margin: 5px 0 0 0; color: #999; font-size: 11px;">
                  This email was sent automatically. Please do not reply to this email.
                </p>
              </div>
            </div>
          `
        }
      ]
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('SendGrid email error:', errorData)
      return NextResponse.json(
        { error: 'Failed to send email', details: errorData.errors?.[0]?.message },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully'
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
