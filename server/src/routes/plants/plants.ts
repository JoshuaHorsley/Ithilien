import { Router } from 'express'
import type { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export const router = Router()

// Get all plants for a user
router.get('/', async (req: Request, res: Response) => {
  const { userId } = req.query
  if (!userId) return res.status(400).json({ error: 'userId is required' })

  try {
    const plants = await prisma.plant.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ data: plants })
  } catch (error) {
    console.error('Fetch plants error:', error)
    res.status(500).json({ error: 'Failed to fetch plants' })
  }
})

// Get a single plant by ID (with care logs)
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const plant = await prisma.plant.findUnique({
      where: { id },
      include: {
        careLogs: { orderBy: { date: 'desc' } },
      },
    })

    if (!plant) return res.status(404).json({ error: 'Plant not found' })
    res.json({ data: plant })
  } catch (error) {
    console.error('Fetch plant error:', error)
    res.status(500).json({ error: 'Failed to fetch plant' })
  }
})

// Mark a plant as watered
router.post('/:id/water', async (req: Request, res: Response) => {
  const { id } = req.params

  try {
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
  const { id } = req.params
  try {
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
  const { id } = req.params
  const { nickname, wateringDays, imageUrl } = req.body

  try {
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
  const { id } = req.params
  try {
    await prisma.careLog.deleteMany({ where: { plantId: id } })
    await prisma.plant.delete({ where: { id } })
    res.json({ message: 'Plant deleted' })
  } catch (error) {
    console.error('Delete plant error:', error)
    res.status(500).json({ error: 'Failed to delete plant' })
  }
})
