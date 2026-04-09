/**
 * Leaderboard Service
 * Handles global and friends leaderboard queries
 */

import { api } from './api'
import { LeaderboardEntry, VehicleType } from '../types'
import { API_ENDPOINTS } from '../constants/api'

interface LeaderboardResponse {
  data: LeaderboardEntry[]
  period_start: string
}

interface FriendsLeaderboardResponse {
  data: LeaderboardEntry[]
}

export const leaderboardService = {
  /**
   * Get global leaderboard with optional vehicle type filter and pagination
   */
  getGlobal: async (params?: {
    vehicle_type?: VehicleType
    page?: number
  }): Promise<LeaderboardResponse> => {
    const { data } = await api.get<LeaderboardResponse>(API_ENDPOINTS.leaderboard.global, { params })
    return data
  },

  /**
   * Get friends leaderboard with optional vehicle type filter
   */
  getFriends: async (params?: {
    vehicle_type?: VehicleType
  }): Promise<FriendsLeaderboardResponse> => {
    const { data } = await api.get<FriendsLeaderboardResponse>(API_ENDPOINTS.leaderboard.friends, { params })
    return data
  },
}
