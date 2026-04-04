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
 * Single-flight refresh promise to prevent concurrent refresh requests
 * If multiple requests fail with 401 at the same time, they share one refresh operation
 */
let refreshPromise: Promise<string> | null = null

/**
 * Performs token refresh with single-flight pattern
 */
async function performTokenRefresh(): Promise<string> {
  // If refresh is already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      // Use raw axios to avoid recursive interceptor
      const { data } = await axios.post(
        `${API_CONFIG.baseURL}/auth/refresh`,
        { refresh_token: refreshToken },
        { timeout: API_CONFIG.timeout }
      )

      const newAccessToken = data.access_token
      await SecureStore.setItemAsync('access_token', newAccessToken)

      return newAccessToken
    } finally {
      // Clear the in-flight refresh promise
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/**
 * Clear stored auth tokens (for failed refresh or logout scenarios)
 */
async function clearAuthTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync('access_token'),
    SecureStore.deleteItemAsync('refresh_token'),
  ])
}

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
 * Uses single-flight pattern to prevent concurrent refresh requests
 */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    // Check if this is a 401 and hasn't been retried yet
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        // Perform refresh with single-flight pattern
        const newAccessToken = await performTokenRefresh()

        // Update original request with new token
        original.headers.Authorization = `Bearer ${newAccessToken}`

        // Retry original request
        return api(original)
      } catch (refreshError) {
        // Refresh failed - clear invalid tokens to prevent retry loops
        await clearAuthTokens()

        // Reject with original error
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)
