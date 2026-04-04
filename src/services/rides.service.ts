/**
 * Rides Service
 * Handles ride lifecycle and ride history queries
 */

import { api } from './api'
import { Ride, VehicleType } from '../types'

interface StartRideResponse {
  ride_id: string
  started_at: string
  ws_token: string
}

interface RideListResponse {
  data: Ride[]
  total: number
  page: number
}

export const ridesService = {
  /**
   * Start a new ride
   */
  start: async (vehicleId: string): Promise<StartRideResponse> => {
    const { data } = await api.post<StartRideResponse>('/rides/start', { vehicle_id: vehicleId })
    return data
  },

  /**
   * Stop an active ride
   */
  stop: async (rideId: string): Promise<Ride> => {
    const { data } = await api.post<Ride>(`/rides/${rideId}/stop`)
    return data
  },

  /**
   * Get paginated list of rides
   */
  list: async (params?: {
    page?: number
    limit?: number
    vehicle_type?: VehicleType
  }): Promise<RideListResponse> => {
    const { data } = await api.get<RideListResponse>('/rides', { params })
    return data
  },

  /**
   * Get a specific ride by ID
   */
  getById: async (id: string): Promise<Ride> => {
    const { data } = await api.get<Ride>(`/rides/${id}`)
    return data
  },
}
