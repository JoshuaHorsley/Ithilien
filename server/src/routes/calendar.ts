import { Router } from 'express'
import type { Request, Response } from 'express'

export const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const { userId, year, month } = req.query

  if (typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' })
  }

  const now = new Date()

  const parsedYear =
    typeof year === 'string' && !Number.isNaN(Number(year))
      ? Number(year)
      : now.getFullYear()

  const parsedMonth =
    typeof month === 'string' && !Number.isNaN(Number(month))
      ? Number(month)
      : now.getMonth() + 1

  if (parsedMonth < 1 || parsedMonth > 12) {
    return res.status(400).json({ error: 'month must be between 1 and 12' })
  }

  try {
    res.json({
      data: {
        userId,
        year: parsedYear,
        month: parsedMonth,
        events: [],
      },
    })
  } catch (error) {
    console.error('Fetch calendar error:', error)
    res.status(500).json({ error: 'Failed to fetch calendar' })
  }
})