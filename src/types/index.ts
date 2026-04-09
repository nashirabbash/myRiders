/**
 * Shared Type Definitions for TrackRide
 * Centralized source of truth for all data models used across the application
 * Matches openapi.json schemas exactly
 */

/**
 * Vehicle types supported by TrackRide
 */
export type VehicleType = 'motor' | 'mobil' | 'sepeda'

/**
 * User profile information (with email, for auth responses)
 */
export interface User {
  id: string
  username: string
  email: string
  display_name: string
  avatar_url?: string
}

/**
 * Public user profile (without email, for public endpoints)
 */
export interface PublicUserProfile {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  created_at?: string
}

/**
 * Auth response from login/register - flat structure per API spec
 */
export interface AuthResponse {
  id: string
  username: string
  email: string
  display_name: string
  avatar_url?: string
  access_token: string
  refresh_token: string
  expires_in: number
}

/**
 * Vehicle owned by a user
 */
export interface Vehicle {
  id: string
  type: VehicleType
  name: string
  brand?: string
  color?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
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
 * Route summary with polyline and cities
 */
export interface RouteSummary {
  polyline: string
  cities: string[]
  bounding_box: {
    north: number
    south: number
    east: number
    west: number
  }
}

/**
 * A completed or in-progress ride - matches RideResponse schema
 */
export interface Ride {
  id: string
  title?: string
  vehicle_id: string
  vehicle_type: VehicleType
  vehicle_name: string
  status: 'active' | 'completed' | 'abandoned'
  started_at: string
  ended_at?: string | null
  distance_km: number
  duration_seconds: number
  max_speed_kmh: number
  avg_speed_kmh: number
  elevation_m: number
  calories: number
  route_summary?: RouteSummary
  created_at?: string
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
 * Owner info for feed items
 */
export interface OwnerInfo {
  id: string
  username: string
  display_name: string
  avatar_url?: string
}

/**
 * A social feed item - a ride with social interaction data
 */
export interface FeedItem extends Ride {
  like_count: number
  comment_count: number
  user_has_liked: boolean
  owner: OwnerInfo
}

/**
 * A user's position on the leaderboard - flat structure per API spec
 */
export interface LeaderboardEntry {
  id: string
  user_id: string
  vehicle_type: VehicleType
  total_km: number
  total_rides: number
  rank: number
  period_type: 'weekly' | 'monthly'
  period_start: string
}
