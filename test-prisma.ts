// Test file to verify Prisma import
import { PrismaClient } from '@prisma/client'

// This should work without TypeScript errors
const testClient = new PrismaClient()

console.log('Prisma import test successful')

export { testClient }
