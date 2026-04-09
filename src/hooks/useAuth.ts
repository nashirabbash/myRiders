/**
 * useAuth - Authentication hook
 * Composes auth service and auth store into one reusable auth flow
 */

import { useAuthStore } from '../stores/auth.store'
import { authService } from '../services/auth.service'
import { User } from '../types'

export function useAuth() {
  const store = useAuthStore()

  /**
   * Register a new user account
   * AuthResponse is flat: extract user fields and tokens
   */
  const register = async (payload: {
    username: string
    email: string
    password: string
    display_name: string
  }): Promise<User> => {
    const result = await authService.register(payload)
    // Extract user from flat AuthResponse
    const user: User = {
      id: result.id,
      username: result.username,
      email: result.email,
      display_name: result.display_name,
      avatar_url: result.avatar_url,
    }
    await store.setAuth(user, result.access_token, result.refresh_token)
    return user
  }

  /**
   * Login with email and password
   * AuthResponse is flat: extract user fields and tokens
   */
  const login = async (email: string, password: string): Promise<User> => {
    const result = await authService.login(email, password)
    // Extract user from flat AuthResponse
    const user: User = {
      id: result.id,
      username: result.username,
      email: result.email,
      display_name: result.display_name,
      avatar_url: result.avatar_url,
    }
    await store.setAuth(user, result.access_token, result.refresh_token)
    return user
  }

  /**
   * Logout and clear auth state
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout()
    } catch {
      // Ignore server-side logout failure, still clear local state
    }
    await store.logout()
  }

  /**
   * Restore session from storage on app launch
   * This is the proper two-step restore:
   * 1. Restore token from SecureStore
   * 2. Fetch current user profile via API
   */
  const restoreSession = async (): Promise<boolean> => {
    // Step 1: Check if we have a stored token
    const hasToken = await store.loadFromStorage()
    if (!hasToken) return false

    try {
      // Step 2: Fetch current user profile
      const user = await authService.getMe()
      // Update store with the fetched user
      useAuthStore.setState({ user })
      return true
    } catch {
      // If profile fetch fails, clear auth state
      await store.logout()
      return false
    }
  }

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    register,
    login,
    logout,
    restoreSession,
  }
}
