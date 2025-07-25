import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? (() => {
  // Determine database URL based on environment
  let databaseUrl: string
  
  if (process.env.NODE_ENV === 'production') {
    // Production: Use Turso database
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
      databaseUrl = `${process.env.TURSO_DATABASE_URL}?authToken=${process.env.TURSO_AUTH_TOKEN}`
      console.log('🚀 Connecting to Turso Cloud Database (Production)')
    } else {
      throw new Error('Missing Turso credentials: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN required in production')
    }
  } else {
    // Development: Use local SQLite
    databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
    console.log('🏠 Connecting to Local SQLite (Development)')
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
