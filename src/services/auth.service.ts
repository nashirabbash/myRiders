/**
 * Authentication Service
 * Handles user registration, login, token refresh, and logout
 */

import axios from 'axios'
import { api } from './api'
import { AuthResponse, User } from '../types'
import { API_CONFIG, API_ENDPOINTS } from '../constants/api'

interface RefreshResponse {
  access_token: string
  expires_in: number
}

export const authService = {
  /**
   * Register a new user
   * Returns flat AuthResponse with user fields and tokens
   */
  register: async (payload: {
    username: string
    email: string
    password: string
    display_name: string
  }): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(API_ENDPOINTS.auth.register, payload)
    return data
  },

  /**
   * Login with email and password
   * Returns flat AuthResponse with user fields and tokens
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(API_ENDPOINTS.auth.login, { email, password })
    return data
  },

  /**
   * Refresh access token using refresh token
   * Uses raw axios to avoid recursive interceptor if refresh endpoint returns 401
   */
  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const { data } = await axios.post<RefreshResponse>(
      `${API_CONFIG.baseURL}${API_ENDPOINTS.auth.refresh}`,
      { refresh_token: refreshToken },
      { timeout: API_CONFIG.timeout }
    )
    return data
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.auth.logout)
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>(API_ENDPOINTS.users.profile)
    return data
  },
}
