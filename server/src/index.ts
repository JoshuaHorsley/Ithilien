import 'dotenv/config'


import express from 'express'
import type { Request, Response } from 'express'

import { auth } from './lib/auth.js'
import { toNodeHandler } from 'better-auth/node'

import cors from 'cors'

import path from 'path'
import { fileURLToPath } from 'url'

import { router as speciesRouter } from './routes/trefleApi/species.js'
import { router as plantsRouter } from './routes/plants/plants.js'
import { router as calendarRouter } from './routes/calendar.js'
import { router as remindersRouter } from './routes/reminders.js'
import { router as userRouter } from './routes/user.js'
import { router as imagesRouter } from './routes/images/images.js'
// const prisma = new PrismaClient() //This wasn't doing anything, so I commented it out.
const app = express()
const PORT = process.env.PORT || 3003

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, '../../client/dist')))

//Express 5 doesn't accept '*' as a path pattern; use a regex catch-all.
//Also avoid intercepting API routes.
app.get(/^(?!\/api).*/, (_, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'))
})


app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))

app.use(express.json())

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

//Automatically-handled BetterAuth routes
app.all('/api/auth/{*splat}', toNodeHandler(auth))

//Imported API Routers
app.use('/api/species', speciesRouter)
app.use('/api/plants', plantsRouter)
app.use('/api/calendar', calendarRouter)
app.use('/api/reminders', remindersRouter)
app.use('/api/user', userRouter)
app.use('/api/images', imagesRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})