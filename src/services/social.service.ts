/**
 * Social Service
 * Handles feed, interactions (follow/like), and profile queries
 */

import { api } from './api'
import { FeedItem, PublicUserProfile } from '../types'
import { API_ENDPOINTS } from '../constants/api'

/**
 * Feed response from GET /v1/feed
 */
interface FeedResponse {
  data: FeedItem[]
  page: number
  limit: number
}

/**
 * Message response from action endpoints
 */
interface MessageResponse {
  message: string
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
   * Returns message response per spec
   */
  likeRide: async (rideId: string): Promise<MessageResponse> => {
    const { data } = await api.post<MessageResponse>(API_ENDPOINTS.social.like(rideId))
    return data
  },

  /**
   * Get public user profile by ID
   */
  getProfile: async (userId: string): Promise<PublicUserProfile> => {
    const { data } = await api.get<PublicUserProfile>(API_ENDPOINTS.users.getById(userId))
    return data
  },
}
