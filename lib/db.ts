import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? (() => {
  console.log('Environment:', process.env.NODE_ENV)
  console.log('Has DATABASE_URL:', !!process.env.DATABASE_URL)
  console.log('Has TURSO_DATABASE_URL:', !!process.env.TURSO_DATABASE_URL)
  console.log('Has TURSO_AUTH_TOKEN:', !!process.env.TURSO_AUTH_TOKEN)
  
  let databaseUrl: string
  
  if (process.env.NODE_ENV === 'production') {
    // Production: Use Turso with HTTP URL and auth token
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
      // Convert libsql:// to https:// for HTTP access
      const tursoUrl = process.env.TURSO_DATABASE_URL.replace('libsql://', 'https://')
      databaseUrl = `${tursoUrl}?authToken=${process.env.TURSO_AUTH_TOKEN}`
      console.log('🚀 Using Turso database via HTTP')
    } else if (process.env.DATABASE_URL) {
      databaseUrl = process.env.DATABASE_URL
      console.log('🚀 Using DATABASE_URL fallback')
    } else {
      throw new Error('Missing database credentials: Need TURSO_DATABASE_URL and TURSO_AUTH_TOKEN')
    }
  } else {
    // Development: Use local SQLite
    databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
    console.log('🏠 Using local SQLite:', databaseUrl)
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })
})()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})