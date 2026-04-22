import { Router } from 'express'
import type { Request, Response } from 'express'
import { prisma, auth } from '../lib/auth.js'

export const router = Router()

async function getSessionUser(req: Request): Promise<{ id: string; email: string } | null> {
    try {
        const session = await auth.api.getSession({ headers: req.headers as any })
        if (!session?.user) return null
        return { id: session.user.id, email: session.user.email }
    }
    catch {
        return null
    }
}

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
    const user = await getSessionUser(req)
    if (!user) return res.status(401).json({ error: 'Not authenticated' })

    const { year, month } = req.query

    const now = new Date()

    let parsedYear = now.getFullYear()

    if (typeof year === 'string' && !Number.isNaN(Number(year))) {
        parsedYear = Number(year)
    }

    let parsedMonth = now.getMonth() + 1

    if (typeof month === 'string' && !Number.isNaN(Number(month))) {
        parsedMonth = Number(month)
    }

    if (parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({ error: 'month must be between 1 and 12' })
    }

    try {
        //load user's plants that have a watering schedule and its watering history
        const plants = await prisma.plant.findMany({
            where: {
                userId: user.id,
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

        //generating watering dates that fall within the month
        for (const plant of plants) {
            if (!plant.wateringDays || plant.wateringDays < 1) continue

            const interval = plant.wateringDays
            const seedDate = plant.createdAt

            let dueDate = addDays(new Date(seedDate), interval)

            while (dueDate < monthStart) {
                dueDate = addDays(dueDate, interval)
            }

            while (isSameOrBefore(dueDate, monthEnd)) {
                const nextDueDate = addDays(dueDate, interval)

                const completedLog = plant.careLogs.find((log: any) => {
                    const logDate = new Date(log.date)
                    return logDate >= dueDate && logDate < nextDueDate
                })

                //setting status for plant watering
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

        //sorting events chronologically before returning
        events.sort((a, b) => {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        })

        res.json({
            data: {
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