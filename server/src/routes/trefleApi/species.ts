import { Router } from 'express'
import type { Plant } from '@prisma/client'
import type { Request, Response } from 'express'
// import { writeFileSync } from 'fs'
import { mapLight, mapHumidity, mapWatering } from './valueConversionHelpers.js'

export const router = Router();
const TREFLE_API_TOKEN = process.env.TREFLE_API_TOKEN;


//GET /api/species/search
interface SpeciesSearchResponseData {
  error: string | undefined,
  data: Omit<Plant, 'id' | 'nickname' | 'userId' | 'lastWatered' | 'wateringDays' | 'createdAt' | 'updatedAt'>[]
}

//GET /api/species/:slug
interface SpeciesDetailsResponseData {
  error: string | undefined,
  data: Omit<Plant, 'id' | 'nickname' | 'userId' | 'lastWatered' | 'wateringDays' | 'createdAt' | 'updatedAt'> | undefined
}




// Species search - calls Trefle API
// Example: GET /api/species/search?q=monstera
router.get('/search', async (req: Request, res: Response<SpeciesSearchResponseData>) => {
  const { q } = req.query as { q: string }


  //Empty response if no query string
  if (!q || q.trim().length === 0) {
    return res.json({ error: undefined, data: [] })
  }

  try {
    const response = await fetch(
      `https://trefle.io/api/v1/plants/search?token=${TREFLE_API_TOKEN}&q=${encodeURIComponent(q)}`
    )

    const json = await response.json()


    
    const plants: any[]= (json.data || []).map((plant: any) => ({
      id: plant.id,
      slug: plant.slug,
      commonName: plant.common_name || 'Unknown',
      scientificName: plant.scientific_name,
      imageUrl: plant.image_url,
      family: plant.family,
    }))

    res.json({ error: undefined, data: plants })
  } catch (error) {
    console.error('Trefle search error:', error)
    res.status(500).json({ error: 'Failed to search plants', data: [] })
  }
})


// Species details - get care/growth data for a specific plant
// Example: GET /api/species/monstera-deliciosa
router.get('/:slug', async (req: Request, res: Response<SpeciesDetailsResponseData>) => {
  const { slug } = req.params

  try {
    const response = await fetch(
      `https://trefle.io/api/v1/species/${slug}?token=${process.env.TREFLE_API_TOKEN}`
    )

    const json = await response.json()
    const plant = json.data

    //Log the trefle raw response
    // writeFileSync('trefle-raw-response.json', JSON.stringify(plant, null, 2))

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found', data: undefined })
    }


    const details: Omit<Plant, 'id' | 'nickname' | 'userId' | 'lastWatered' | 'wateringDays' | 'createdAt' | 'updatedAt'> = {
      speciesName: plant.scientific_name,
      commonName: plant.common_name || 'Unknown',
      imageUrl: plant.image_url,
      trefleId: plant.id,
      slug: plant.slug,
      family: plant.family,
      light: mapLight(plant.growth?.light),
      humidity: mapHumidity(plant.growth?.atmospheric_humidity),
      watering: mapWatering(plant.growth?.minimum_precipitation, plant.growth?.maximum_precipitation),
      growthRate: plant.specifications?.growth_rate || null,
      toxicity: plant.specifications?.toxicity || null,
      edible: plant.edible || false,
      flowerColor: plant.flower?.color || [],
      foliageColor: plant.foliage?.color || [],
      plantImageId: null,
    }
    

    res.json({ error: undefined, data: details })
  } catch (error) {
    console.error('Trefle details error:', error)
    res.status(500).json({ error: 'Failed to fetch plant details', data: undefined })
  }
})

