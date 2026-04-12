import express from 'express'
import dotenv from 'dotenv'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './lib/auth.js'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import speciesRoutes from './routes/perenualApi/species.js'

dotenv.config()

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 3003

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())

// Species routes (Trefle API)
app.use('/api/species', speciesRoutes)

// Auth routes (better-auth)
app.all('/api/auth/{*splat}', toNodeHandler(auth))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Get all plants for a user
app.get('/api/plants', async (req, res) => {
  const { userId } = req.query
  if (!userId) return res.status(400).json({ error: 'userId is required' })

  try {
    const plants = await prisma.plant.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ data: plants })
  } catch (error) {
    console.error('Fetch plants error:', error)
    res.status(500).json({ error: 'Failed to fetch plants' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})