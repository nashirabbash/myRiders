/**
 * Auth Store - Global Authentication State
 * Centralized Zustand store for user authentication and session persistence
 */

import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { User } from '../types'

interface AuthStore {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, access: string, refresh: string) => Promise<void>
  logout: () => Promise<void>
  loadFromStorage: () => Promise<boolean>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  /**
   * Set authenticated user and store tokens in SecureStore
   */
  setAuth: async (user, access, refresh) => {
    await SecureStore.setItemAsync('access_token', access)
    await SecureStore.setItemAsync('refresh_token', refresh)
    set({ user, accessToken: access, isAuthenticated: true })
  },

  /**
   * Clear authentication state and remove stored tokens
   */
  logout: async () => {
    await SecureStore.deleteItemAsync('access_token')
    await SecureStore.deleteItemAsync('refresh_token')
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  /**
   * Restore authentication token from SecureStore (called on app launch)
   * Note: This only restores the token. User profile should be fetched separately via getMe()
   * to establish full authenticated state.
   */
  loadFromStorage: async () => {
    const token = await SecureStore.getItemAsync('access_token')
    if (!token) return false
    set({ accessToken: token, isAuthenticated: true })
    return true
  },
}))
