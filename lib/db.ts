import { PrismaClient } from '@prisma/client'

// Diagnostic logging for database configuration
console.log('Environment:', process.env.NODE_ENV)
console.log('Has DATABASE_URL:', !!process.env.DATABASE_URL)
console.log('Has TURSO_DATABASE_URL:', !!process.env.TURSO_DATABASE_URL)
console.log('Has TURSO_AUTH_TOKEN:', !!process.env.TURSO_AUTH_TOKEN)

// Determine which database URL to use
let databaseUrl = process.env.DATABASE_URL

// For production with Turso, ensure we have the right format
if (process.env.NODE_ENV === 'production' && process.env.TURSO_AUTH_TOKEN) {
  if (process.env.TURSO_DATABASE_URL) {
    databaseUrl = `${process.env.TURSO_DATABASE_URL}?authToken=${process.env.TURSO_AUTH_TOKEN}`
  } else if (databaseUrl?.startsWith('libsql://') && !databaseUrl.includes('authToken')) {
    databaseUrl = `${databaseUrl}?authToken=${process.env.TURSO_AUTH_TOKEN}`
  }
  console.log('🚀 Using Turso HTTPS database')
} else {
  console.log('🚀 Using DATABASE_URL')
}

// Create Prisma client with proper configuration
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma