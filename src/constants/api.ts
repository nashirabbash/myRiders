/**
 * Global API configuration and endpoints
 * Centralized configuration to avoid hardcoded URLs across the codebase
 */

// Check raw environment variables before fallback
const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL
const RAW_WS_URL = process.env.EXPO_PUBLIC_WS_URL
const RAW_MAPS_API_KEY = process.env.EXPO_PUBLIC_MAPS_API_KEY

// Read from environment variables with fallbacks for development
// Local dev server per openapi.json: http://127.0.0.1:8080
const API_URL = RAW_API_URL || 'http://127.0.0.1:8080'
const WS_URL = RAW_WS_URL || 'ws://127.0.0.1:8080'
const MAPS_API_KEY = RAW_MAPS_API_KEY || ''

// API base URLs
export const API_CONFIG = {
  baseURL: API_URL,
  wsURL: WS_URL,
  mapsKey: MAPS_API_KEY,
  timeout: 10000,
}

// API endpoints - all paths match openapi.json spec
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/v1/auth/login',
    register: '/v1/auth/register',
    refresh: '/v1/auth/refresh',
    logout: '/v1/auth/logout',
  },
  // Rides
  rides: {
    start: '/v1/rides/start',
    list: '/v1/rides',
    detail: (id: string) => `/v1/rides/${id}`,
    stop: (id: string) => `/v1/rides/${id}/stop`,
    stream: (id: string) => `/v1/rides/${id}/stream`,
  },
  // Users
  users: {
    profile: '/v1/users/me',
    update: '/v1/users/me',
    getById: (id: string) => `/v1/users/${id}`,
  },
  // Vehicles
  vehicles: {
    list: '/v1/vehicles',
    create: '/v1/vehicles',
    update: (id: string) => `/v1/vehicles/${id}`,
    delete: (id: string) => `/v1/vehicles/${id}`,
  },
  // Leaderboard
  leaderboard: {
    global: '/v1/leaderboard',
    friends: '/v1/leaderboard/friends',
  },
  // Social
  social: {
    feed: '/v1/feed',
    like: (rideId: string) => `/v1/rides/${rideId}/like`,
    follow: (userId: string) => `/v1/users/${userId}/follow`,
    unfollow: (userId: string) => `/v1/users/${userId}/follow`,
    comment: (rideId: string) => `/v1/rides/${rideId}/comments`,
  },
}

// Validate environment variables on startup
export function validateEnvironment() {
  if (!RAW_API_URL) {
    console.warn('⚠️  EXPO_PUBLIC_API_URL not configured, using fallback http://localhost:3000/v1')
  }
  if (!RAW_WS_URL) {
    console.warn('⚠️  EXPO_PUBLIC_WS_URL not configured, using fallback ws://localhost:3000/v1')
  }
  if (!RAW_MAPS_API_KEY) {
    console.warn('⚠️  EXPO_PUBLIC_MAPS_API_KEY not configured, Google Maps may not work')
  }
}
