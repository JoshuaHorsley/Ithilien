import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3003',
  database: prismaAdapter(prisma, {
    provider: 'mysql',
  }),
  secret: process.env.AUTH_SECRET || 'dev-secret-key',
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours, per DDD spec
  },
  trustedOrigins: ['http://localhost:5173'],
})

export { auth, prisma }