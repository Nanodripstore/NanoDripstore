import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Complete system diagnostic
    const diagnostic = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      
      // Environment variables check
      envVars: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : 'MISSING',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET (length: ' + process.env.GOOGLE_CLIENT_SECRET.length + ')' : 'MISSING',
        DATABASE_URL: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'MISSING',
        NODE_ENV: process.env.NODE_ENV
      },
      
      // URL construction test
      urls: {
        baseUrl: process.env.NEXTAUTH_URL,
        signInUrl: `${process.env.NEXTAUTH_URL}/api/auth/signin`,
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        googleOAuthUrl: `https://accounts.google.com/oauth/authorize?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL + '/api/auth/callback/google')}&scope=openid%20email%20profile&response_type=code&state=test`
      },
      
      // Validation checks
      validationChecks: {
        hasValidNextAuthUrl: !!(process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith('https://')),
        hasValidGoogleClientId: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.includes('apps.googleusercontent.com')),
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrlEndsCorrectly: process.env.NEXTAUTH_URL?.endsWith('.in') || false,
        clientIdFormat: process.env.GOOGLE_CLIENT_ID?.match(/^\d+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/) ? 'VALID' : 'INVALID'
      },
      
      // Manual test URLs
      manualTests: {
        directGoogleOAuth: `https://accounts.google.com/oauth/authorize?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL + '/api/auth/callback/google')}&scope=openid%20email%20profile&response_type=code&state=manual-test`,
        nextAuthSignIn: `${process.env.NEXTAUTH_URL}/api/auth/signin/google`
      },
      
      // Common issues to check
      troubleshootingSteps: [
        "1. Test the 'directGoogleOAuth' URL above in a new browser tab",
        "2. If it fails with 'invalid_client', the issue is in Google Cloud Console",
        "3. If it works, the issue is with NextAuth configuration",
        "4. Check that OAuth consent screen is published (not testing)",
        "5. Verify application type is 'Web application' in Google Console",
        "6. Ensure JavaScript origins include: " + process.env.NEXTAUTH_URL,
        "7. Ensure redirect URI is exactly: " + process.env.NEXTAUTH_URL + "/api/auth/callback/google"
      ]
    }

    return NextResponse.json(diagnostic, { 
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
