/**
 * Vehicles Service
 * Handles vehicle CRUD operations
 */

import { api } from './api'
import { Vehicle, VehicleType } from '../types'
import { API_ENDPOINTS } from '../constants/api'

export const vehiclesService = {
  /**
   * Get all vehicles for the current user
   */
  list: async (): Promise<Vehicle[]> => {
    const { data } = await api.get<Vehicle[]>(API_ENDPOINTS.vehicles.list)
    return data
  },

  /**
   * Create a new vehicle
   */
  create: async (payload: {
    type: VehicleType
    name: string
    brand?: string
    color?: string
  }): Promise<Vehicle> => {
    const { data } = await api.post<Vehicle>(API_ENDPOINTS.vehicles.create, payload)
    return data
  },

  /**
   * Update an existing vehicle
   */
  update: async (
    id: string,
    payload: Partial<Pick<Vehicle, 'name' | 'brand' | 'color' | 'is_active'>>
  ): Promise<Vehicle> => {
    const { data } = await api.put<Vehicle>(API_ENDPOINTS.vehicles.update(id), payload)
    return data
  },

  /**
   * Delete a vehicle
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.vehicles.delete(id))
  },
}
