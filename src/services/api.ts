/**
 * Shared Axios API Client
 * Centralized HTTP client with token management and auto-refresh
 */

import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { API_CONFIG } from '../constants/api'

export const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
})

/**
 * Request interceptor - attach access token to all requests
 */
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Response interceptor - handle 401 and auto-refresh tokens
 */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    // Check if this is a 401 and hasn't been retried yet
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        // Get refresh token from storage
        const refreshToken = await SecureStore.getItemAsync('refresh_token')
        if (!refreshToken) {
          return Promise.reject(error)
        }

        // Use raw axios to refresh token (avoid recursive interceptor)
        const { data } = await axios.post(
          `${API_CONFIG.baseURL}/auth/refresh`,
          { refresh_token: refreshToken },
          { timeout: API_CONFIG.timeout }
        )

        // Store new access token
        await SecureStore.setItemAsync('access_token', data.access_token)

        // Update original request with new token
        original.headers.Authorization = `Bearer ${data.access_token}`

        // Retry original request
        return api(original)
      } catch (refreshError) {
        // Refresh failed - reject with original error
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)
