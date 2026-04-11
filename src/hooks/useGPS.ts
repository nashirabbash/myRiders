/**
 * useGPS - GPS tracking hook
 * Handles location permissions, background task registration, and ride tracking
 */

import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import * as Linking from 'expo-linking'
import { Alert } from 'react-native'
import { GPSBuffer } from '../utils/gpsBuffer'

export const LOCATION_TASK = 'trackride-background-location'

TaskManager.defineTask(LOCATION_TASK, ({ data, error }: any) => {
  if (error || !data?.locations?.length) return

  const rideId = (global as any).__activeRideId
  if (!rideId) return

  const loc = data.locations[0]
  try {
    GPSBuffer.addRaw(rideId, loc)
  } catch (e) {
    console.error('[GPS Task] Error storing location:', e)
  }
})

export function useGPS() {
  /**
   * Request location permissions (foreground and background)
   */
  const requestPermissions = async (): Promise<boolean> => {
    const { status: fg } = await Location.requestForegroundPermissionsAsync()
    if (fg !== 'granted') {
      Alert.alert(
        'Izin lokasi diperlukan',
        'TrackRide membutuhkan akses lokasi untuk merekam perjalanan.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() },
        ]
      )
      return false
    }

    // Request background permission (best-effort, may be denied)
    await Location.requestBackgroundPermissionsAsync()
    return true
  }

  /**
   * Start GPS tracking for an active ride
   */
  const startTracking = async (rideId: string): Promise<void> => {
    const granted = await requestPermissions()
    if (!granted) throw new Error('PERMISSION_DENIED')

    // Mark this ride as active globally
    ;(global as any).__activeRideId = rideId

    // Start background location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 5000, // Update every 5 seconds
      distanceInterval: 10, // Or every 10 meters
      foregroundService: {
        notificationTitle: 'TrackRide sedang merekam',
        notificationBody: 'Tap untuk kembali ke app',
      },
      pausesUpdatesAutomatically: false,
    })
  }

  /**
   * Stop GPS tracking and clean up
   */
  const stopTracking = async (): Promise<void> => {
    ;(global as any).__activeRideId = null

    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK)
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK)
    }
  }

  /**
   * Get current location (one-time, not continuous)
   */
  const getCurrentLocation = async (): Promise<Location.LocationObject> => {
    return Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    })
  }

  return {
    startTracking,
    stopTracking,
    getCurrentLocation,
    requestPermissions,
  }
}
