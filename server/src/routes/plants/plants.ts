/*
 * FILE: plants.ts
 * DESCRIPTION: API routes for plant management. Handles fetching all plants sorted
 *              by care urgency, fetching a single plant, marking as watered,
 *              viewing care history, editing, and deleting plants.
 */

import { Router } from 'express'
import type { Request, Response } from 'express'
import { prisma, auth } from '../../lib/auth.js'
import { mapLight, mapHumidity, mapWatering } from '../trefleApi/valueConversionHelpers.js'

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



/*
 * FUNCTION: calculateNextWatering
 * PARAMETERS: lastWatered  - the date the plant was last watered (or null if never)
 *             wateringDays - how many days between waterings (or null if unknown)
 * RETURNS: A Date representing when the plant should next be watered, or null if
 *          there is not enough information to calculate it
 * DESCRIPTION: Adds the watering interval in days to the last watered date to get
 *              the next watering date. If either value is missing, returns null.
 */
function calculateNextWatering(lastWatered: Date | null, wateringDays: number | null): Date | null
{
    // If nolast watered date or watering interval = can't calculate the next watering
    if (!lastWatered || !wateringDays)
    {

        return null

    }

    // Create a new date object based on last watered and add the watering interval
    const nextWatering = new Date(lastWatered)
    nextWatering.setDate(nextWatering.getDate() + wateringDays)
    return nextWatering

}



/*
 * FUNCTION: calculateDaysUntilWatering
 * PARAMETERS: nextWatering - the date the plant should next be watered (or null)
 * RETURNS: A number representing days until next watering. Negative means overdue.
 *          Returns null if nextWatering is null.
 * DESCRIPTION: Compares the next watering date to today and returns the difference
 *              in days. A negative number means the plant is overdue for watering.
 */
function calculateDaysUntilWatering(nextWatering: Date | null): number | null
{
    // If no next watering date = can't calculate days until watering
    if (!nextWatering)
    {

        return null

    }

    // Get today's date and calculate the difference in milliseconds, then convert to days
    const today = new Date()
    const diffInMs = nextWatering.getTime() - today.getTime()
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
    return diffInDays

}


/*
 * FUNCTION: getUrgencyScore
 * PARAMETERS: daysUntilWatering - days until the plant needs watering (can be null)
 * RETURNS: A number used for sorting. Lower numbers sort first (more urgent).
 * DESCRIPTION: Converts daysUntilWatering into a sort score. Plants with no watering
 *              data are sorted to the end. Overdue and due-today plants sort first.
 */
function getUrgencyScore(daysUntilWatering: number | null): number
{

    // If no watering data = return a high score to sort at the end
    if (daysUntilWatering === null)
    {

        return 9999

    }

    return daysUntilWatering

}




// Get all plants for a user
router.get('/', async (req: Request, res: Response) => {
    const user = await getSessionUser(req)
    if (!user) return res.status(401).json({ error: 'Not authenticated' })

    try {
        const plantsFromDb = await prisma.plant.findMany({
            where: { userId: user.id },
        })

        // Calculate next watering date and days until watering for each plant
        const plantsWithUrgency = plantsFromDb.map((plant) => {
            const nextWatering = calculateNextWatering(plant.lastWatered, plant.wateringDays)
            const daysUntilWatering = calculateDaysUntilWatering(nextWatering)
            return {
                ...plant,
                nextWatering,
                daysUntilWatering,
            }
        })

        // Sort so the most overdue plants appear first, no-schedule plants at the end
        plantsWithUrgency.sort((a, b) => {
            const scoreA = getUrgencyScore(a.daysUntilWatering)
            const scoreB = getUrgencyScore(b.daysUntilWatering)
            return scoreA - scoreB
        })

        res.json({ data: plantsWithUrgency })
    } catch (error) {
        console.error('Fetch plants error:', error)
        res.status(500).json({ error: 'Failed to fetch plants' })
    }
})


// Add a new plant to the user's garden
router.post('/', async (req: Request, res: Response) => {
  const user = await getSessionUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  const { nickname, slug, wateringDays } = req.body

  if (!nickname || !slug) {
    return res.status(400).json({ error: 'nickname and slug are required' })
  }

  try {
    const trefleRes = await fetch(
      `https://trefle.io/api/v1/species/${slug}?token=${process.env.TREFLE_API_TOKEN}`
    )
    const trefleJson = await trefleRes.json() as any
    const species = trefleJson.data

    if (!species) {
      return res.status(404).json({ error: 'Species not found on Trefle' })
    }

    const plant = await prisma.plant.create({
      data: {
        nickname,
        userId: user.id,
        wateringDays: wateringDays ?? null,
        speciesName: species.scientific_name,
        commonName: species.common_name || 'Unknown',
        imageUrl: species.image_url,
        trefleId: species.id,
        slug: species.slug,
        family: species.family,
        light: mapLight(species.growth?.light),
        humidity: mapHumidity(species.growth?.atmospheric_humidity),
        watering: mapWatering(species.growth?.minimum_precipitation, species.growth?.maximum_precipitation),
        wateringDays: 7,
        growthRate: species.specifications?.growth_rate || null,
        toxicity: species.specifications?.toxicity || null,
        edible: species.edible || false,
        flowerColor: species.flower?.color || [],
        foliageColor: species.foliage?.color || [],
      },
    })

    res.json({ data: plant })
  } catch (error) {
    console.error('Add plant error:', error)
    res.status(500).json({ error: 'Failed to add plant' })
  }
})


// Get a single plant by ID (with care logs)
router.get('/:id', async (req: Request, res: Response) => {
  const user = await getSessionUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  const id = req.params.id as string

  try {
    const plant = await prisma.plant.findUnique({
        where: { id },
      include: {
        careLogs: { orderBy: { date: 'desc' } },
      },
    })

    if (!plant) return res.status(404).json({ error: 'Plant not found' })
    if (plant.userId !== user.id) return res.status(403).json({ error: 'Forbidden' })
    res.json({ data: plant })
  } catch (error) {
    console.error('Fetch plant error:', error)
    res.status(500).json({ error: 'Failed to fetch plant' })
  }
})

// Mark a plant as watered
router.post('/:id/water', async (req: Request, res: Response) => {
  const user = await getSessionUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  const id = req.params.id as string

  try {
    const existing = await prisma.plant.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Plant not found' })
    if (existing.userId !== user.id) return res.status(403).json({ error: 'Forbidden' })

    const now = new Date()

    const plant = await prisma.plant.update({
      where: { id },
      data: { lastWatered: now },
    })

    await prisma.careLog.create({
      data: { action: 'Watered', date: now, plantId: id },
    })

    res.json({ data: plant })
  } catch (error) {
    console.error('Water plant error:', error)
    res.status(500).json({ error: 'Failed to mark plant as watered' })
  }
})

// Care history log for a plant
router.get('/:id/history', async (req: Request, res: Response) => {
  const user = await getSessionUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  const id = req.params.id as string
  try {
    const plant = await prisma.plant.findUnique({ where: { id } })
    if (!plant) return res.status(404).json({ error: 'Plant not found' })
    if (plant.userId !== user.id) return res.status(403).json({ error: 'Forbidden' })

    const logs = await prisma.careLog.findMany({
      where: { plantId: id },
      orderBy: { date: 'desc' },
    })
    res.json({ data: logs })
  } catch (error) {
    console.error('Fetch history error:', error)
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

// Edit a plant (nickname and/or watering schedule)
router.put('/:id', async (req: Request, res: Response) => {
  const user = await getSessionUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  const id = req.params.id as string
  const { nickname, wateringDays, imageUrl } = req.body

  try {
    const existing = await prisma.plant.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Plant not found' })
    if (existing.userId !== user.id) return res.status(403).json({ error: 'Forbidden' })

    const updateData: { nickname?: string; wateringDays?: number; imageUrl?: string } = {}
    if (nickname !== undefined) updateData.nickname = nickname
    if (wateringDays !== undefined) updateData.wateringDays = wateringDays
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl

    const plant = await prisma.plant.update({
      where: { id },
      data: updateData,
    })

    res.json({ data: plant })
  } catch (error) {
    console.error('Update plant error:', error)
    res.status(500).json({ error: 'Failed to update plant' })
  }
})

// Delete a plant
router.delete('/:id', async (req: Request, res: Response) => {
  const user = await getSessionUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  const id = req.params.id as string
  try {
    const existing = await prisma.plant.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Plant not found' })
    if (existing.userId !== user.id) return res.status(403).json({ error: 'Forbidden' })

    await prisma.careLog.deleteMany({ where: { plantId: id } })
    await prisma.plant.delete({ where: { id } })
    res.json({ message: 'Plant deleted' })
  } catch (error) {
    console.error('Delete plant error:', error)
    res.status(500).json({ error: 'Failed to delete plant' })
  }
})
