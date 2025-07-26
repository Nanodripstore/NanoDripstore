import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force this route to be dynamic since it connects to database
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Health check started...')
    
    // Test database connection
    await prisma.$connect()
    console.log('Database connection successful')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log(`User count query successful: ${userCount}`)
    
    // Check database type
    const databaseUrl = process.env.DATABASE_URL
    const dbType = databaseUrl?.startsWith('libsql:') ? 'Turso' :
                   databaseUrl?.startsWith('file:') ? 'SQLite' :
                   databaseUrl?.startsWith('postgres:') ? 'PostgreSQL' : 'Unknown'
    
    return NextResponse.json({ 
      status: 'OK', 
      message: 'NanoDrip Store API is running',
      database: 'Connected',
      databaseType: dbType,
      userCount,
      environment: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    // Enhanced error information for production debugging
    const errorInfo = {
      status: 'ERROR',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: (error as any)?.code || 'NO_CODE',
      environment: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
      dbUrlProtocol: process.env.DATABASE_URL?.split(':')[0] || 'none',
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorInfo, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
