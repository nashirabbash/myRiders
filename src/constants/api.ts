/**
 * Global API configuration and endpoints
 * Centralized configuration to avoid hardcoded URLs across the codebase
 */

// Read from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/v1'
const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000/v1'
const MAPS_API_KEY = process.env.EXPO_PUBLIC_MAPS_API_KEY || ''

// API base URLs
export const API_CONFIG = {
  baseURL: API_URL,
  wsURL: WS_URL,
  mapsKey: MAPS_API_KEY,
  timeout: 10000,
}

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  // Rides
  rides: {
    list: '/rides',
    create: '/rides',
    detail: (id: string) => `/rides/${id}`,
    update: (id: string) => `/rides/${id}`,
    end: (id: string) => `/rides/${id}/end`,
  },
  // Users
  users: {
    profile: '/users/me',
    update: '/users/me',
    getPublic: (username: string) => `/users/${username}`,
  },
  // Leaderboard
  leaderboard: {
    global: '/leaderboard/global',
    friends: '/leaderboard/friends',
  },
  // Social
  social: {
    feed: '/feed',
    like: (rideId: string) => `/rides/${rideId}/like`,
    unlike: (rideId: string) => `/rides/${rideId}/unlike`,
  },
}

// Validate environment variables on startup
export function validateEnvironment() {
  if (!API_URL) {
    console.warn('⚠️  EXPO_PUBLIC_API_URL not configured, using default http://localhost:3000/v1')
  }
  if (!WS_URL) {
    console.warn('⚠️  EXPO_PUBLIC_WS_URL not configured, using default ws://localhost:3000/v1')
  }
  if (!MAPS_API_KEY) {
    console.warn('⚠️  EXPO_PUBLIC_MAPS_API_KEY not configured, maps may not work')
  }
}
