

// Convert Trefle's 0-10 light scale to a human-friendly label
export function mapLight(value: number): string | null {
    if (value === null || value === undefined) return null
    if (value <= 3) return 'Low light'
    if (value <= 6) return 'Bright indirect'
    return 'Full sun'
  }
  
// Convert Trefle's 0-10 humidity scale to a label
export function mapHumidity(value: number): string | null {
    if (value === null || value === undefined) return null
    if (value <= 3) return 'Low'
    if (value <= 6) return 'Medium'
    return 'High'
}

// Convert precipitation data into a simple watering frequency
export function mapWatering(minPrecip: number, maxPrecip: number): string | null {
    if (!minPrecip && !maxPrecip) return null
    const avg = ((minPrecip || 0) + (maxPrecip || 0)) / 2
    if (avg <= 500) return 'Infrequent (drought-tolerant)'
    if (avg <= 1000) return 'Average (weekly)'
    return 'Frequent (keep moist)'
}
