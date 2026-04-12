import express, { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import type { Request, Response } from 'express'

const prisma = new PrismaClient();
export const router = Router();
const TREFLE_API_TOKEN = process.env.TREFLE_API_TOKEN;

// Convert Trefle's 0-10 light scale to a human-friendly label
function mapLight(value: number): string | null {
  if (value === null || value === undefined) return null
  if (value <= 3) return 'Low light'
  if (value <= 6) return 'Bright indirect'
  return 'Full sun'
}

// Convert Trefle's 0-10 humidity scale to a label
function mapHumidity(value: number): string | null {
  if (value === null || value === undefined) return null
  if (value <= 3) return 'Low'
  if (value <= 6) return 'Medium'
  return 'High'
}

// Convert precipitation data into a simple watering frequency
function mapWatering(minPrecip: number, maxPrecip: number): string | null {
  if (!minPrecip && !maxPrecip) return null
  const avg = ((minPrecip || 0) + (maxPrecip || 0)) / 2
  if (avg <= 500) return 'Infrequent (drought-tolerant)'
  if (avg <= 1000) return 'Average (weekly)'
  return 'Frequent (keep moist)'
}



// Species search - calls Trefle API
// Example: GET /api/species/search?q=monstera
router.get('/search', async (req: Request, res: Response) => {
  const { q } = req.query as { q: string }


  //Empty response if no query string
  if (!q || q.trim().length === 0) {
    return res.json({ data: [] })
  }

  try {
    const response = await fetch(
      `https://trefle.io/api/v1/plants/search?token=${TREFLE_API_TOKEN}&q=${encodeURIComponent(q)}`
    )

    const json = await response.json()

    const plants = (json.data || []).map(plant => ({
      id: plant.id,
      slug: plant.slug,
      commonName: plant.common_name || 'Unknown',
      scientificName: plant.scientific_name,
      imageUrl: plant.image_url,
      family: plant.family,
    }))

    res.json({ data: plants })
  } catch (error) {
    console.error('Trefle search error:', error)
    res.status(500).json({ error: 'Failed to search plants' })
  }
})

// Species details - get care/growth data for a specific plant
// Example: GET /api/species/monstera-deliciosa
router.get('/:slug', async (req, res) => {
  const { slug } = req.params

  try {
    const response = await fetch(
      `https://trefle.io/api/v1/species/${slug}?token=${process.env.TREFLE_API_TOKEN}`
    )

    const json = await response.json()
    const plant = json.data

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' })
    }

    const details = {
      id: plant.id,
      slug: plant.slug,
      commonName: plant.common_name || 'Unknown',
      scientificName: plant.scientific_name,
      family: plant.family,
      imageUrl: plant.image_url,
      light: mapLight(plant.growth?.light),
      humidity: mapHumidity(plant.growth?.atmospheric_humidity),
      watering: mapWatering(plant.growth?.minimum_precipitation, plant.growth?.maximum_precipitation),
      growthRate: plant.specifications?.growth_rate || null,
      toxicity: plant.specifications?.toxicity || null,
      edible: plant.edible || false,
      duration: plant.duration || [],
      flowerColor: plant.flower?.color || [],
      foliageColor: plant.foliage?.color || [],
      leafRetention: plant.foliage?.leaf_retention || null,
      phMin: plant.growth?.ph_minimum || null,
      phMax: plant.growth?.ph_maximum || null,
      growthMonths: plant.growth?.growth_months || [],
      bloomMonths: plant.growth?.bloom_months || [],
      sowing: plant.growth?.sowing || null,
    }

    res.json({ data: details })
  } catch (error) {
    console.error('Trefle details error:', error)
    res.status(500).json({ error: 'Failed to fetch plant details' })
  }
})

// Save a new plant to the user's garden
// POST /api/species/add
router.post('/add', async (req, res) => {
  const { nickname, slug, userId } = req.body

  if (!nickname || !slug || !userId) {
    return res.status(400).json({ error: 'nickname, slug, and userId are required' })
  }

  try {
    const trefleRes = await fetch(
      `https://trefle.io/api/v1/species/${slug}?token=${process.env.TREFLE_API_TOKEN}`
    )
    const trefleJson = await trefleRes.json()
    const species = trefleJson.data

    if (!species) {
      return res.status(404).json({ error: 'Species not found on Trefle' })
    }

    const speciesData = {
      trefleId: species.id,
      slug: species.slug,
      commonName: species.common_name || 'Unknown',
      scientificName: species.scientific_name,
      family: species.family,
      imageUrl: species.image_url,
      light: mapLight(species.growth?.light),
      humidity: mapHumidity(species.growth?.atmospheric_humidity),
      watering: mapWatering(species.growth?.minimum_precipitation, species.growth?.maximum_precipitation),
      growthRate: species.specifications?.growth_rate || null,
      toxicity: species.specifications?.toxicity || null,
      edible: species.edible || false,
      flowerColor: species.flower?.color || [],
      foliageColor: species.foliage?.color || [],
    }

    const plant = await prisma.plant.create({
      data: {
        nickname: nickname,
        speciesName: speciesData.scientificName,
        speciesData: speciesData,
        imageUrl: speciesData.imageUrl,
        userId: userId,
      },
    })

    res.json({ data: plant })
  } catch (error) {
    console.error('Add plant error:', error)
    res.status(500).json({ error: 'Failed to add plant' })
  }
})