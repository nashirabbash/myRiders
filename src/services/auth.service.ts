/**
 * Authentication Service
 * Handles user registration, login, token refresh, and logout
 */

import { api } from './api'
import { User } from '../types'

interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
}

interface RefreshResponse {
  access_token: string
  expires_in: number
}

export const authService = {
  /**
   * Register a new user
   */
  register: async (payload: {
    username: string
    email: string
    password: string
    display_name: string
  }): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    return data
  },

  /**
   * Refresh access token using refresh token
   */
  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const { data } = await api.post<RefreshResponse>('/auth/refresh', { refresh_token: refreshToken })
    return data
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me')
    return data
  },
}
