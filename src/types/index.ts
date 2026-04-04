/**
 * Shared Type Definitions for TrackRide
 * Centralized source of truth for all data models used across the application
 */

/**
 * Vehicle types supported by TrackRide
 */
export type VehicleType = 'motor' | 'mobil' | 'sepeda'

/**
 * User profile information
 */
export interface User {
  id: string
  username: string
  email: string
  display_name: string
  avatar_url?: string
}

/**
 * Vehicle owned by a user
 */
export interface Vehicle {
  id: string
  user_id: string
  type: VehicleType
  name: string
  brand?: string
  color?: string
  is_active: boolean
}

/**
 * Metrics captured during a ride
 */
export interface RideMetrics {
  distance_km: number
  duration_seconds: number
  max_speed_kmh: number
  avg_speed_kmh: number
  elevation_m: number
  calories: number
}

/**
 * A completed or in-progress ride
 */
export interface Ride extends RideMetrics {
  id: string
  user_id: string
  vehicle_id: string
  vehicle: Vehicle
  title?: string
  started_at: string
  ended_at?: string
  status: 'active' | 'completed' | 'abandoned'
  route_summary?: {
    polyline: string
    cities: string[]
    bounding_box: {
      north: number
      south: number
      east: number
      west: number
    }
  }
}

/**
 * A GPS coordinate point with metadata
 */
export interface GPSPoint {
  lat: number
  lng: number
  speed_kmh: number
  elevation_m: number
  timestamp: string
}

/**
 * A user's position on the leaderboard
 */
export interface LeaderboardEntry {
  rank: number
  user: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>
  total_km: number
  total_rides: number
  vehicle_type: VehicleType | null
}

/**
 * A social feed item (ride completion notification)
 */
export interface FeedItem {
  type: 'ride_completed'
  user: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>
  ride: Pick<Ride, 'id' | 'distance_km' | 'duration_seconds' | 'vehicle'>
  created_at: string
}
