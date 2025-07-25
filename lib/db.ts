import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? (() => {
  console.log('Environment:', process.env.NODE_ENV)
  console.log('Has TURSO_DATABASE_URL:', !!process.env.TURSO_DATABASE_URL)
  console.log('Has DATABASE_URL:', !!process.env.DATABASE_URL)
  console.log('Has TURSO_AUTH_TOKEN:', !!process.env.TURSO_AUTH_TOKEN)
  
  // Ensure we have Turso credentials
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error('Missing Turso credentials: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required')
  }
  
  // Convert libsql:// URL to HTTPS for HTTP access to Turso
  const tursoHttpsUrl = process.env.TURSO_DATABASE_URL.replace('libsql://', 'https://')
  const databaseUrl = `${tursoHttpsUrl}?authToken=${process.env.TURSO_AUTH_TOKEN}`
  
  console.log('🚀 Using Turso database via HTTPS for both local and production')
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
  })

  if (process.env.NODE_ENV === 'production' && process.env.TURSO_AUTH_TOKEN && process.env.DATABASE_URL?.startsWith('libsql://')) {
    // Production: Use Turso/libSQL adapter
    const libsqlConfig = {
      url: process.env.DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    }
    const adapter = new PrismaLibSQL(libsqlConfig)
    console.log('🚀 Using Turso/libSQL adapter')
    return new PrismaClient({ adapter })
  } else {
    // Development: Use local SQLite or fallback to DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
    console.log('🏠 Using local SQLite or DATABASE_URL')
    return new PrismaClient({
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    })
  }
})()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})