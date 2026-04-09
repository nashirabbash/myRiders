/**
 * Social Service
 * Handles feed, interactions (follow/like), and profile queries
 */

import { api } from './api'
import { FeedItem, User } from '../types'
import { API_ENDPOINTS } from '../constants/api'

interface FeedResponse {
  data: FeedItem[]
  total: number
  page: number
  hasMore: boolean
}

interface LikeResponse {
  liked: boolean
}

export const socialService = {
  /**
   * Get paginated social feed
   */
  getFeed: async (page = 1, limit = 20): Promise<FeedResponse> => {
    const { data } = await api.get<FeedResponse>(API_ENDPOINTS.social.feed, { params: { page, limit } })
    return data
  },

  /**
   * Follow a user
   */
  follow: async (userId: string): Promise<void> => {
    await api.post(API_ENDPOINTS.social.follow(userId))
  },

  /**
   * Unfollow a user
   */
  unfollow: async (userId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.social.unfollow(userId))
  },

  /**
   * Like a ride (toggles like state)
   */
  likeRide: async (rideId: string): Promise<LikeResponse> => {
    const { data } = await api.post<LikeResponse>(API_ENDPOINTS.social.like(rideId))
    return data
  },

  /**
   * Get user profile by ID
   */
  getProfile: async (userId: string): Promise<User> => {
    const { data } = await api.get<User>(API_ENDPOINTS.users.getById(userId))
    return data
  },
}
