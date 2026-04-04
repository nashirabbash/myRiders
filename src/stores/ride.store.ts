/**
 * Ride Store - Global Ride Recording State
 * Centralized Zustand store for active ride session and live metrics
 */

import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { VehicleType } from '../types'

interface LiveMetrics {
  distance_km: number
  duration_seconds: number
  max_speed_kmh: number
  avg_speed_kmh: number
  calories: number
  elevation_m: number
}

interface RideStore {
  activeRideId: string | null
  wsToken: string | null
  vehicleType: VehicleType | null
  metrics: LiveMetrics
  polylinePoints: { lat: number; lng: number }[]
  isRecording: boolean
  startRide: (rideId: string, wsToken: string, vehicleType: VehicleType) => Promise<void>
  updateMetrics: (update: Partial<LiveMetrics>) => void
  addPoint: (point: { lat: number; lng: number }) => void
  stopRide: () => Promise<void>
  loadFromStorage: () => Promise<void>
}

/**
 * Helper to create fresh empty metrics object (avoid shared reference)
 */
function createEmptyMetrics(): LiveMetrics {
  return {
    distance_km: 0,
    duration_seconds: 0,
    max_speed_kmh: 0,
    avg_speed_kmh: 0,
    calories: 0,
    elevation_m: 0,
  }
}

export const useRideStore = create<RideStore>((set) => ({
  activeRideId: null,
  wsToken: null,
  vehicleType: null,
  metrics: createEmptyMetrics(),
  polylinePoints: [],
  isRecording: false,

  /**
   * Start a new ride recording session
   */
  startRide: async (rideId, wsToken, vehicleType) => {
    await SecureStore.setItemAsync('active_ride_id', rideId)
    set({
      activeRideId: rideId,
      wsToken,
      vehicleType,
      isRecording: true,
      metrics: createEmptyMetrics(),
      polylinePoints: [],
    })
  },

  /**
   * Update live metrics (merge with existing values)
   */
  updateMetrics: (update) =>
    set((s) => ({
      metrics: { ...s.metrics, ...update },
    })),

  /**
   * Add GPS point to route (keep max 500 points in memory)
   */
  addPoint: (point) =>
    set((s) => ({
      polylinePoints: [...s.polylinePoints, point].slice(-500),
    })),

  /**
   * Stop ride recording and clear active ride state
   */
  stopRide: async () => {
    await SecureStore.deleteItemAsync('active_ride_id')
    set({
      activeRideId: null,
      wsToken: null,
      vehicleType: null,
      isRecording: false,
      metrics: createEmptyMetrics(),
      polylinePoints: [],
    })
  },

  /**
   * Restore active ride state from SecureStore (called on app launch for crash recovery)
   * Note: Only the ride ID is persisted, not full metrics or route.
   * App should fetch the completed ride from API and prompt user to resume or discard.
   */
  loadFromStorage: async () => {
    const rideId = await SecureStore.getItemAsync('active_ride_id')
    if (rideId) {
      // Restore only the ride ID without setting isRecording = true
      // This allows the app to detect a crashed ride without pretending the session is fully active
      // Later code can prompt user to resume, discard, or fetch the ride from API
      set({
        activeRideId: rideId,
        // Keep isRecording: false and wsToken/vehicleType as null
        // so the recovery flow is explicit, not auto-resumed
      })
    }
  },
}))
