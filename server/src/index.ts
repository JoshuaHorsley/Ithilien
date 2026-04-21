import express from 'express'
import type { Request, Response } from 'express'

import { auth } from './lib/auth.js'
import { toNodeHandler } from 'better-auth/node'

import dotenv from 'dotenv'
import cors from 'cors'

import { router as speciesRouter } from './routes/trefleApi/species.js'
import { router as plantsRouter } from './routes/plants/plants.js'
import { router as calendarRouter } from './routes/calendar.js'
import { router as remindersRouter } from './routes/reminders.js'
import { router as userRouter } from './routes/user.js'


dotenv.config()
const app = express()
const PORT = process.env.PORT || 3003

app.use(cors({
  origin: 'http://localhost:5173',
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


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})