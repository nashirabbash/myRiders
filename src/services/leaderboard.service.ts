/**
 * Leaderboard Service
 * Handles global and friends leaderboard queries
 */

import { api } from './api'
import { LeaderboardEntry, VehicleType } from '../types'

interface LeaderboardResponse {
  data: LeaderboardEntry[]
  my_rank: LeaderboardEntry | null
  period_start: string
}

interface FriendsLeaderboardResponse {
  data: LeaderboardEntry[]
  my_rank: LeaderboardEntry | null
}

export const leaderboardService = {
  /**
   * Get global leaderboard with optional vehicle type filter and pagination
   */
  getGlobal: async (params?: {
    vehicle_type?: VehicleType
    page?: number
  }): Promise<LeaderboardResponse> => {
    const { data } = await api.get<LeaderboardResponse>('/leaderboard', { params })
    return data
  },

  /**
   * Get friends leaderboard with optional vehicle type filter
   */
  getFriends: async (params?: {
    vehicle_type?: VehicleType
  }): Promise<FriendsLeaderboardResponse> => {
    const { data } = await api.get<FriendsLeaderboardResponse>('/leaderboard/friends', { params })
    return data
  },
}
