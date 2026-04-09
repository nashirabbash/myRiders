/**
 * Leaderboard Service
 * Handles global and friends leaderboard queries
 */

import { api } from './api'
import { LeaderboardEntry, VehicleType } from '../types'
import { API_ENDPOINTS } from '../constants/api'

/**
 * Leaderboard response from GET /v1/leaderboard
 * Matches spec: includes page, limit, period_type, vehicle_type
 */
interface LeaderboardResponse {
  data: LeaderboardEntry[]
  page: number
  limit: number
  period_type: string
  vehicle_type?: string
}

/**
 * Friends leaderboard response from GET /v1/leaderboard/friends
 */
interface FriendsLeaderboardResponse {
  data: LeaderboardEntry[]
  page: number
  limit: number
  period_type: string
  vehicle_type?: string
}

export const leaderboardService = {
  /**
   * Get global leaderboard with optional vehicle type filter and pagination
   */
  getGlobal: async (params?: {
    vehicle_type?: VehicleType
    page?: number
    limit?: number
  }): Promise<LeaderboardResponse> => {
    const { data } = await api.get<LeaderboardResponse>(API_ENDPOINTS.leaderboard.global, { params })
    return data
  },

  /**
   * Get friends leaderboard with optional vehicle type filter and pagination
   */
  getFriends: async (params?: {
    vehicle_type?: VehicleType
    page?: number
    limit?: number
  }): Promise<FriendsLeaderboardResponse> => {
    const { data } = await api.get<FriendsLeaderboardResponse>(API_ENDPOINTS.leaderboard.friends, { params })
    return data
  },
}
