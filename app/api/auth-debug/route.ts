import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const authConfig = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
      expectedGoogleRedirectURI: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
      currentDomain: 'https://nanodripstore.in'
    }

    return NextResponse.json({
      status: 'OK',
      message: 'Auth Configuration Debug',
      config: authConfig,
      instructions: {
        googleConsoleSteps: [
          '1. Go to https://console.cloud.google.com/',
          '2. APIs & Services → Credentials',
          '3. Edit OAuth 2.0 Client ID',
          '4. Verify Client ID matches above',
          '5. Add to Authorized JavaScript origins: https://nanodripstore.in',
          '6. Add to Authorized redirect URIs: https://nanodripstore.in/api/auth/callback/google'
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
