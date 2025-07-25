import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test the OAuth URL construction
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    const scope = 'openid email profile'
    const responseType = 'code'
    const state = 'test-state'
    
    const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${encodeURIComponent(clientId || '')}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=${responseType}&` +
      `state=${state}`

    return NextResponse.json({
      status: 'OK',
      message: 'OAuth URL Test',
      config: {
        clientId: clientId,
        redirectUri: redirectUri,
        constructedUrl: googleAuthUrl,
        instructions: [
          '1. Copy the constructedUrl above',
          '2. Paste it in a new browser tab',
          '3. This will test if Google recognizes your OAuth configuration',
          '4. If it works, the issue is with NextAuth',
          '5. If it fails, the issue is with Google OAuth setup'
        ]
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
