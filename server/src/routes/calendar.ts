import { Router } from 'express'
import type { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export const router = Router()

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month - 1, 1, 0, 0, 0, 0)
}

function endOfMonth(year: number, month: number): Date {
  return new Date(year, month, 0, 23, 59, 59, 999)
}

function isSameOrBefore(a: Date, b: Date): boolean {
  return a.getTime() <= b.getTime()
}

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
    const plants = await prisma.plant.findMany({
      where: {
        userId,
        wateringDays: {
          not: null,
        },
      },
      include: {
        careLogs: {
          where: {
            action: 'Watered',
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
      orderBy: {
        nickname: 'asc',
      },
    })

    const monthStart = startOfMonth(parsedYear, parsedMonth)
    const monthEnd = endOfMonth(parsedYear, parsedMonth)
    const events = []

    for (const plant of plants) {
      if (!plant.wateringDays || plant.wateringDays < 1) continue

      const interval = plant.wateringDays
      const seedDate = plant.lastWatered ?? plant.createdAt

      let dueDate = addDays(new Date(seedDate), interval)

      while (dueDate < monthStart) {
        dueDate = addDays(dueDate, interval)
      }

      while (isSameOrBefore(dueDate, monthEnd)) {
        const nextDueDate = addDays(dueDate, interval)

        const completedLog = plant.careLogs.find((log) => {
          const logDate = new Date(log.date)
          return logDate >= dueDate && logDate < nextDueDate
        })

        let status: 'upcoming' | 'completed' | 'overdue' = 'upcoming'

        if (completedLog) {
          status = 'completed'
        } else if (dueDate < now) {
          status = 'overdue'
        }

        events.push({
          plantId: plant.id,
          nickname: plant.nickname,
          speciesName: plant.speciesName,
          imageUrl: plant.imageUrl,
          dueDate,
          status,
          wateringDays: plant.wateringDays,
          completedAt: completedLog ? completedLog.date : null,
        })

        dueDate = nextDueDate
      }
    }

    res.json({
      data: {
        userId,
        year: parsedYear,
        month: parsedMonth,
        events,
      },
    })
  } catch (error) {
    console.error('Fetch calendar error:', error)
    res.status(500).json({ error: 'Failed to fetch calendar' })
  }
})