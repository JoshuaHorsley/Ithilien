const { betterAuth } = require('better-auth')
const { prismaAdapter } = require('better-auth/adapters/prisma')
const { PrismaClient } = require('@prisma/client')

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
  trustedOrigins: ['http://localhost:5173'],
})

module.exports = { auth, prisma }