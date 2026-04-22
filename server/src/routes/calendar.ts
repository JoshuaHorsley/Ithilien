import { Router } from 'express'
import type { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { auth } from '../lib/auth.js'

export const router = Router();
const prisma = new PrismaClient()


/*
 * FUNCTION: getSessionUser
 * PARAMETERS: req - Express request object containing cookies and headers
 * RETURNS: Promise resolving to the authenticated user's ID and email, or null if not authenticated
 * DESCRIPTION: Uses better-auth's API to retrieve the current session based on the
 *              request headers. Returns the user's ID and email, or null if not found.
 */
async function getSessionUser(req: Request): Promise<{ id: string; email: string } | null> {

    try {

        const session = await auth.api.getSession({ headers: req.headers as any })

        if (!session?.user) {
            return null
        }

        return { id: session.user.id, email: session.user.email }

    }
    catch {
        return null
    }

}


/*
 * ROUTE: GET /api/calendar
 * PARAMETERS (query): userId - the ID of the user to fetch the schedule for
 *                     month  - the month number (1-12)
 *                     year   - the four-digit year
 * DESCRIPTION: Fetches all plants for the user that have watering data, then
 *              calculates all the watering dates that fall within the requested
 *              month. Each event is marked as:
 *                - 'completed' if the plant was watered on or after that date
 *                - 'overdue'   if the date is in the past and not completed
 *                - 'upcoming'  if the date is today or in the future
 */
router.get('/', async (req: Request, res: Response) => {

    // Make sure the user is logged in
    const user = await getSessionUser(req)

    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' })
    }

    // Validate the userId query parameter
    const { userId } = req.query

    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'userId is required' })
    }

    // Make sure the user can only fetch their own calendar
    if (userId !== user.id) {
        return res.status(403).json({ error: 'You do not have permission to view this calendar' })
    }

    // Validate the month and year parameters
    const monthParam = req.query.month
    const yearParam = req.query.year

    if (!monthParam || !yearParam) {
        return res.status(400).json({ error: 'month and year are required' })
    }

    const month = parseInt(monthParam as string, 10)
    const year = parseInt(yearParam as string, 10)

    if (isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: 'month must be a number between 1 and 12' })
    }

    if (isNaN(year) || year < 2000 || year > 2100) {
        return res.status(400).json({ error: 'year must be a valid four-digit year' })
    }

    try {

        // Fetch all plants that have enough data to calculate a watering schedule
        const plants = await prisma.plant.findMany({
            where: {
                userId: userId,
                lastWatered: { not: null },
                wateringDays: { not: null },
            },
            select: {
                id: true,
                nickname: true,
                lastWatered: true,
                wateringDays: true,
            },
        })

        const today = new Date()

        // The first and last day of the requested month
        const monthStart = new Date(year, month - 1, 1)
        const monthEnd = new Date(year, month, 0)

        const events: {
            plantId: string,
            nickname: string,
            date: string,
            status: 'upcoming' | 'overdue' | 'completed'
        }[] = []

        for (const plant of plants) {

            // Calculate the next watering date starting from lastWatered
            let currentWatering = new Date(plant.lastWatered!)
            currentWatering.setDate(currentWatering.getDate() + plant.wateringDays!)

            // Walk forward through watering dates until we pass the end of the month
            // This handles plants that water multiple times in a month
            while (currentWatering <= monthEnd) {

                // Only include dates that fall within this month
                if (currentWatering >= monthStart) {

                    // Determine the status of this watering event
                    let status: 'upcoming' | 'overdue' | 'completed'

                    // If the plant was watered on or after this scheduled date, mark completed
                    if (plant.lastWatered! >= currentWatering) {
                        status = 'completed'
                    }
                    // If the scheduled date is in the past and not completed, it is overdue
                    else if (currentWatering < today) {
                        status = 'overdue'
                    }
                    // Otherwise it is upcoming
                    else {
                        status = 'upcoming'
                    }

                    // Format the date as YYYY-MM-DD for easy comparison in the frontend
                    const dateString = currentWatering.toISOString().split('T')[0] as string

                    events.push({
                        plantId: plant.id,
                        nickname: plant.nickname,
                        date: dateString,
                        status,
                    })

                }

                // Advance to the next watering date
                currentWatering = new Date(currentWatering)
                currentWatering.setDate(currentWatering.getDate() + plant.wateringDays!)

            }

        }

        res.json({ data: events })

    }
    catch (err) {
        console.error('Fetch calendar error:', err)
        res.status(500).json({ error: 'Failed to fetch calendar' })
    }

})