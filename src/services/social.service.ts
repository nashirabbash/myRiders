/**
 * Social Service
 * Handles feed, interactions (follow/like/comment), and profile queries
 */

import { api } from './api'
import { FeedItem, User } from '../types'

interface FeedResponse {
  data: FeedItem[]
  total: number
  page: number
  hasMore: boolean
}

interface FollowResponse {
  following: boolean
}

interface LikeResponse {
  liked: boolean
  total_likes: number
}

interface CommentResponse {
  id: string
  content: string
  created_at: string
}

interface ProfileResponse extends User {
  total_rides: number
  total_km: number
  is_following: boolean
}

export const socialService = {
  /**
   * Get paginated social feed
   */
  getFeed: async (page = 1, limit = 20): Promise<FeedResponse> => {
    const { data } = await api.get<FeedResponse>('/feed', { params: { page, limit } })
    return data
  },

  /**
   * Follow a user
   */
  follow: async (userId: string): Promise<FollowResponse> => {
    const { data } = await api.post<FollowResponse>(`/users/${userId}/follow`)
    return data
  },

  /**
   * Unfollow a user
   */
  unfollow: async (userId: string): Promise<FollowResponse> => {
    const { data } = await api.delete<FollowResponse>(`/users/${userId}/follow`)
    return data
  },

  /**
   * Like a ride
   */
  likeRide: async (rideId: string): Promise<LikeResponse> => {
    const { data } = await api.post<LikeResponse>(`/rides/${rideId}/like`)
    return data
  },

  /**
   * Comment on a ride
   */
  commentRide: async (rideId: string, content: string): Promise<CommentResponse> => {
    const { data } = await api.post<CommentResponse>(`/rides/${rideId}/comments`, { content })
    return data
  },

  /**
   * Get user profile
   */
  getProfile: async (userId: string): Promise<ProfileResponse> => {
    const { data } = await api.get<ProfileResponse>(`/users/${userId}`)
    return data
  },
}
