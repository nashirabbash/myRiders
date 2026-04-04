/**
 * Vehicles Service
 * Handles vehicle CRUD operations
 */

import { api } from './api'
import { Vehicle, VehicleType } from '../types'

export const vehiclesService = {
  /**
   * Get all vehicles for the current user
   */
  list: async (): Promise<Vehicle[]> => {
    const { data } = await api.get<Vehicle[]>('/vehicles')
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
    const { data } = await api.post<Vehicle>('/vehicles', payload)
    return data
  },

  /**
   * Update an existing vehicle
   */
  update: async (
    id: string,
    payload: Partial<Pick<Vehicle, 'name' | 'brand' | 'color' | 'is_active'>>
  ): Promise<Vehicle> => {
    const { data } = await api.put<Vehicle>(`/vehicles/${id}`, payload)
    return data
  },

  /**
   * Delete a vehicle
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/vehicles/${id}`)
  },
}
