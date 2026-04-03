/**
 * Global API configuration and endpoints
 * Centralized configuration to avoid hardcoded URLs across the codebase
 */

// Check raw environment variables before fallback
const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL
const RAW_WS_URL = process.env.EXPO_PUBLIC_WS_URL
const RAW_MAPS_API_KEY = process.env.EXPO_PUBLIC_MAPS_API_KEY

// Read from environment variables with fallbacks for development
const API_URL = RAW_API_URL || 'http://localhost:3000/v1'
const WS_URL = RAW_WS_URL || 'ws://localhost:3000/v1'
const MAPS_API_KEY = RAW_MAPS_API_KEY || ''

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
