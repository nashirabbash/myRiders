/**
 * useNotifications - Push notifications hook
 * Sets up notification handler and provides registration function
 */

import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { api } from '../services/api'

/**
 * Configure notification handler at module scope
 * This determines how notifications are displayed when the app is in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

/**
 * Register device for push notifications
 * Requests permission, gets Expo push token, and sends to backend
 * Returns the push token on success, or null if permission denied
 */
export async function registerForPushNotifications(): Promise<string | null> {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') {
    return null
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    if (!projectId) {
      console.warn('[Notifications] No EAS project ID found')
      return null
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId })
    const tokenData = token.data

    // Send token to backend to enable push notifications for this user
    await api.put('/users/me', { push_token: tokenData })

    return tokenData
  } catch (e) {
    console.error('[Notifications] Error registering for push notifications:', e)
    return null
  }
}

/**
 * Hook interface - mostly for consistency
 * The main exported function is registerForPushNotifications
 */
export function useNotifications() {
  return { registerForPushNotifications }
}
