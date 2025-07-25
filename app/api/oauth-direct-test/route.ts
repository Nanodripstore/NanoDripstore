import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (!code) {
    return NextResponse.json({ 
      error: 'No authorization code received',
      url: request.url,
      searchParams: Object.fromEntries(searchParams.entries())
    })
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://nanodripstore.netlify.app/api/oauth-direct-test',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      return NextResponse.json({ 
        error: 'Token exchange failed',
        details: tokenData,
        status: tokenResponse.status
      })
    }

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    return NextResponse.json({
      success: true,
      message: '🎉 OAuth is working!',
      user: userData,
      tokenData: { ...tokenData, access_token: '[HIDDEN]', refresh_token: '[HIDDEN]' }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Exception during OAuth flow',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
