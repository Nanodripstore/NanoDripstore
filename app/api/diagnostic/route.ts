import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic environment check without database
    const diagnostics = {
      status: 'OK',
      message: 'NanoDrip Store Diagnostic API',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasNEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
        hasNEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        hasGOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
        hasGOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
        hasDATABASE_URL: !!process.env.DATABASE_URL,
        hasTURSO_DATABASE_URL: !!process.env.TURSO_DATABASE_URL,
        hasTURSO_AUTH_TOKEN: !!process.env.TURSO_AUTH_TOKEN,
        NEXTAUTH_URL_value: process.env.NEXTAUTH_URL,
        DATABASE_URL_prefix: process.env.DATABASE_URL?.substring(0, 50) + '...',
      },
      urls: {
        currentURL: 'https://nanodripstore.in',
        healthEndpoint: 'https://nanodripstore.in/api/health',
        diagnosticEndpoint: 'https://nanodripstore.in/api/diagnostic',
        authSignIn: 'https://nanodripstore.in/api/auth/signin'
      }
    }
    
    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error('Diagnostic failed:', error)
    
    return NextResponse.json({
      status: 'ERROR',
      message: 'Diagnostic failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
