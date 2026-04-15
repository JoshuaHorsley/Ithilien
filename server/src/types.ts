export type TreflePlant = {
  id: number
  slug: string
  commonName: string
  scientificName: string
  imageUrl: string
  family: string | null
  light: string | null
  humidity: string | null
  watering: string | null
  growthRate: string | null
  toxicity: string | null
  edible: boolean
  duration: string[]
  flowerColor: string[]
  foliageColor: string[]
  leafRetention: boolean | null
  phMin: number | null
  phMax: number | null
  growthMonths: string[]
  bloomMonths: string[]
  sowing: string | null
}