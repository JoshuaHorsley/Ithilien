import { Router } from 'express'
import type { Request, Response } from 'express'

export const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    res.json({ data: { events: [] } })
  } catch (error) {
    console.error('Fetch calendar error:', error)
    res.status(500).json({ error: 'Failed to fetch calendar' })
  }
})