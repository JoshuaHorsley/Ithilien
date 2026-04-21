/*
 * FILE: reminders.ts
 * DATE: 04 - 16 - 2026
 * DESCRIPTION: API route for fetching upcoming watering reminders for the
 *              authenticated user. Returns plants that need watering today
 *              or are already overdue.
 */

import { Router } from 'express'
import type { Request, Response } from 'express'
import { prisma, auth } from '../lib/auth.js'

export const router = Router()


/*
 * FUNCTION: getSessionUser
 * PARAMETERS: req - Express request object containing cookies and headers
 * RETURNS: Promise resolving to the authenticated user's ID and email, or null if not authenticated
 * DESCRIPTION: Uses better-auth's API to retrieve the current session based on the request
 *              headers. Returns the user's ID and email if found, otherwise returns null.
 */
async function getSessionUser(req: Request): Promise<{ id: string; email: string } | null> {

    try {

        const session = await auth.api.getSession({ headers: req.headers as any })

        if (!session?.user)
        {

            return null

        }

        return { id: session.user.id, email: session.user.email }

    }
    catch
    {

        return null

    }

}


/*
 * ROUTE: GET /api/reminders
 * RETURNS: A JSON object containing a count of upcoming reminders and an array of plant details
 * DESCRIPTION: Fetches all plants for the authenticated user that need watering within the
 *              next day or are already overdue. For each matching plant, calculates the
 *              next watering date. Returns a count and the list of plant details.
 *
 * RESPONSE:
 *          {
 *              count: number,
 *              items: [
 *                {
 *                  plantId: string,
 *                  nickname: string,
 *                  nextWatering: Date | null,
 *                  daysUntilWatering: number | null
 *                }
 *              ]
 *          }
 */
router.get('/', async (req: Request, res: Response) => {

    // Make sure the user is logged in
    const user = await getSessionUser(req)

    // If no user found in session, return 401 Unauthorized
    if (!user)
    {

        return res.status(401).json({ error: 'Not authenticated' })

    }

    try
    {

        // Fetch all plants that have watering data so we can calculate urgency
        const allPlants = await prisma.plant.findMany({
            where: {
                userId: user.id,
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

        // Calculate next watering for each plant and filter to only urgent ones
        const urgentPlants = []

        for (const plant of allPlants)
        {

            // Calculate next watering date by adding wateringDays to lastWatered
            const nextWatering = new Date(plant.lastWatered!)
            nextWatering.setDate(nextWatering.getDate() + plant.wateringDays!)

            // Calculate how many days until watering is needed
            const diffInMs = nextWatering.getTime() - today.getTime()
            const daysUntilWatering = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))

            // Include the plant if it needs watering today or is already overdue
            // daysUntilWatering <= 1 means: due today, due tomorrow, or overdue
            if (daysUntilWatering <= 1)
            {

                urgentPlants.push({
                    plantId: plant.id,
                    nickname: plant.nickname,
                    nextWatering,
                    daysUntilWatering,
                })

            }

        }

        res.json({
            count: urgentPlants.length,
            items: urgentPlants,
        })

    }
    catch (err)
    {

        console.error('Fetch reminders error:', err)
        res.status(500).json({ error: 'Failed to fetch reminders' })

    }

})