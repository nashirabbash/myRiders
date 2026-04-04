/**
 * Metrics utility - formatting and calculation helpers
 * Pure functions for distance, duration, calorie estimation, and geodesic distance
 */

/**
 * Format seconds into human-readable duration string
 * @param seconds - Total seconds (0+)
 * @returns "H:MM:SS" if hours > 0, else "MM:SS"
 */
export function formatDuration(seconds: number): string {
  let s = Math.round(seconds % 60)
  let m = Math.floor((seconds % 3600) / 60)
  let h = Math.floor(seconds / 3600)

  // Handle rounding edge case: 59.6s rounds to 60s, carry into minutes
  if (s === 60) {
    s = 0
    m += 1
  }
  if (m === 60) {
    m = 0
    h += 1
  }

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Format distance for display
 * @param km - Distance in kilometers
 * @returns "123 m" for < 1 km, else "1.2 km"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(1)} km`
}

/**
 * Estimate calories burned (cycling/biking)
 * MET-based estimation: assumes average weight, no heart rate sensor
 * Accuracy ±15% without HR data
 * @param distanceKm - Total distance traveled
 * @param durationMinutes - Total duration in minutes
 * @param weightKg - User weight in kg (default 70)
 * @returns Estimated calories burned
 */
export function estimateCalories(
  distanceKm: number,
  durationMinutes: number,
  weightKg = 70
): number {
  if (durationMinutes === 0) return 0
  const avgSpeed = (distanceKm / durationMinutes) * 60
  const met = avgSpeed < 15 ? 6.0 : avgSpeed < 20 ? 8.0 : 10.0
  return Math.round(met * weightKg * (durationMinutes / 60))
}

/**
 * Calculate geodesic distance between two GPS coordinates
 * Haversine formula with Earth radius 6371 km
 * @param lat1 - Latitude of first point (decimal degrees)
 * @param lng1 - Longitude of first point (decimal degrees)
 * @param lat2 - Latitude of second point (decimal degrees)
 * @param lng2 - Longitude of second point (decimal degrees)
 * @returns Distance in kilometers
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
