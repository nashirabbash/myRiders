# TrackRide — Frontend Developer Guide
**React Native (Expo Bare Workflow) · MVP v1.0**

> Dokumen ini mencakup setup, hooks, services, stores, dan utils — semua fungsi yang tinggal dipakai di komponen. Penyusunan komponen & UI dilakukan secara terpisah.
> Untuk spesifikasi backend dan API, lihat `CLAUDE-backend.md`.

---

## Quick Reference

| Item | Detail |
|---|---|
| Platform | iOS & Android |
| Framework | React Native (Expo Bare Workflow) |
| Language | TypeScript |
| Minimum OS | iOS 15 / Android 10 (API 29) |
| Base URL (dev) | `http://localhost:8080/v1` |
| Base URL (prod) | `https://api.trackride.app/v1` |
| WS URL (prod) | `wss://api.trackride.app/v1` |

---

## 1. Project Setup

### 1.1 Dependencies

```bash
npx create-expo-app TrackRide --template expo-template-blank-typescript
cd TrackRide

# Navigation
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# GPS & Maps
npx expo install expo-location expo-task-manager
npx expo install react-native-maps

# Canvas & Share
npx expo install @shopify/react-native-skia
npx expo install expo-media-library expo-sharing expo-file-system

# Auth
npx expo install expo-secure-store

# Networking & State
npm install axios
npm install zustand
npm install @tanstack/react-query

# Offline GPS buffer
npx expo install expo-sqlite

# Push notifications
npx expo install expo-notifications expo-constants

# Utils
npm install date-fns
npm install @mapbox/polyline
```

### 1.2 Struktur folder

```
src/
├── hooks/              # Semua custom hooks
│   ├── useAuth.ts
│   ├── useGPS.ts
│   ├── useWebSocket.ts
│   ├── useShareCard.ts
│   └── useNotifications.ts
├── services/           # API calls per domain
│   ├── api.ts          # Axios instance + interceptors
│   ├── auth.service.ts
│   ├── rides.service.ts
│   ├── vehicles.service.ts
│   ├── social.service.ts
│   └── leaderboard.service.ts
├── stores/             # Zustand global state
│   ├── auth.store.ts
│   └── ride.store.ts
├── utils/
│   ├── polyline.ts     # Decode Google Encoded Polyline
│   ├── metrics.ts      # Kalori, elevasi, format durasi
│   └── gpsBuffer.ts    # SQLite offline buffer
├── constants/
│   └── vehicles.ts     # Config warna & metrik per kendaraan
└── types/
    └── index.ts        # Semua shared types
```

### 1.3 Environment variables

```bash
# .env.local
EXPO_PUBLIC_API_URL=http://localhost:8080/v1
EXPO_PUBLIC_WS_URL=ws://localhost:8080/v1
EXPO_PUBLIC_MAPS_API_KEY=your_google_maps_key
```

---

## 2. Types

```typescript
// types/index.ts

export type VehicleType = 'motor' | 'mobil' | 'sepeda'

export interface User {
  id: string
  username: string
  email: string
  display_name: string
  avatar_url?: string
}

export interface Vehicle {
  id: string
  user_id: string
  type: VehicleType
  name: string
  brand?: string
  color?: string
  is_active: boolean
}

export interface RideMetrics {
  distance_km: number
  duration_seconds: number
  max_speed_kmh: number
  avg_speed_kmh: number
  elevation_m: number
  calories: number
}

export interface Ride extends RideMetrics {
  id: string
  user_id: string
  vehicle_id: string
  vehicle: Vehicle
  title?: string
  started_at: string
  ended_at?: string
  status: 'active' | 'completed' | 'abandoned'
  route_summary?: {
    polyline: string
    cities: string[]
    bounding_box: { north: number; south: number; east: number; west: number }
  }
}

export interface GPSPoint {
  lat: number
  lng: number
  speed_kmh: number
  elevation_m: number
  timestamp: string
}

export interface LeaderboardEntry {
  rank: number
  user: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>
  total_km: number
  total_rides: number
  vehicle_type: VehicleType | null
}

export interface FeedItem {
  type: 'ride_completed'
  user: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>
  ride: Pick<Ride, 'id' | 'distance_km' | 'duration_seconds' | 'vehicle'>
  created_at: string
}
```

---

## 3. Constants

```typescript
// constants/vehicles.ts

export const VEHICLE_CONFIG = {
  motor: {
    label: 'Motor',
    color: '#4ADE80',
    bgColor: '#0A1F0A',
    metrics: [
      { key: 'max_speed_kmh', label: 'Kec. maks', unit: 'km/h', highlight: true },
      { key: 'distance_km',   label: 'Jarak',     unit: 'km' },
      { key: 'duration',      label: 'Durasi',     unit: '' },
    ],
  },
  mobil: {
    label: 'Mobil',
    color: '#60A5FA',
    bgColor: '#0A1428',
    metrics: [
      { key: 'distance_km', label: 'Jarak',     unit: 'km',  highlight: true },
      { key: 'cities',      label: 'Rute kota', unit: '' },
      { key: 'duration',    label: 'Durasi',    unit: '' },
    ],
  },
  sepeda: {
    label: 'Sepeda',
    color: '#FBBF24',
    bgColor: '#1A0F00',
    metrics: [
      { key: 'calories',    label: 'Kalori',  unit: 'kal', highlight: true },
      { key: 'distance_km', label: 'Jarak',   unit: 'km' },
      { key: 'elevation_m', label: 'Elevasi', unit: 'm' },
    ],
  },
} as const
```

---

## 4. Services (API Layer)

### 4.1 Axios instance + interceptors

```typescript
// services/api.ts
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto refresh saat 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = await SecureStore.getItemAsync('refresh_token')
      const { data } = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
        { refresh_token: refreshToken }
      )
      await SecureStore.setItemAsync('access_token', data.access_token)
      original.headers.Authorization = `Bearer ${data.access_token}`
      return api(original)
    }
    return Promise.reject(error)
  }
)
```

### 4.2 Auth service

```typescript
// services/auth.service.ts
import { api } from './api'
import { User } from '../types'

export const authService = {
  register: async (payload: {
    username: string; email: string; password: string; display_name: string
  }) => {
    const { data } = await api.post('/auth/register', payload)
    return data as { user: User; access_token: string; refresh_token: string }
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data as { user: User; access_token: string; refresh_token: string }
  },

  refresh: async (refreshToken: string) => {
    const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken })
    return data as { access_token: string; expires_in: number }
  },

  logout: async () => { await api.post('/auth/logout') },

  getMe: async () => {
    const { data } = await api.get('/users/me')
    return data as User
  },
}
```

### 4.3 Vehicles service

```typescript
// services/vehicles.service.ts
import { api } from './api'
import { Vehicle, VehicleType } from '../types'

export const vehiclesService = {
  list: async () => {
    const { data } = await api.get('/vehicles')
    return data as Vehicle[]
  },

  create: async (payload: { type: VehicleType; name: string; brand?: string; color?: string }) => {
    const { data } = await api.post('/vehicles', payload)
    return data as Vehicle
  },

  update: async (id: string, payload: Partial<Pick<Vehicle, 'name' | 'brand' | 'color' | 'is_active'>>) => {
    const { data } = await api.put(`/vehicles/${id}`, payload)
    return data as Vehicle
  },

  delete: async (id: string) => { await api.delete(`/vehicles/${id}`) },
}
```

### 4.4 Rides service

```typescript
// services/rides.service.ts
import { api } from './api'
import { Ride, VehicleType } from '../types'

export const ridesService = {
  start: async (vehicleId: string) => {
    const { data } = await api.post('/rides/start', { vehicle_id: vehicleId })
    return data as { ride_id: string; started_at: string; ws_token: string }
  },

  stop: async (rideId: string) => {
    const { data } = await api.post(`/rides/${rideId}/stop`)
    return data as Ride
  },

  list: async (params?: { page?: number; limit?: number; vehicle_type?: VehicleType }) => {
    const { data } = await api.get('/rides', { params })
    return data as { data: Ride[]; total: number; page: number }
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/rides/${id}`)
    return data as Ride
  },
}
```

### 4.5 Social service

```typescript
// services/social.service.ts
import { api } from './api'
import { FeedItem, User } from '../types'

export const socialService = {
  getFeed: async (page = 1, limit = 20) => {
    const { data } = await api.get('/feed', { params: { page, limit } })
    return data as { data: FeedItem[]; total: number; page: number; hasMore: boolean }
  },

  follow: async (userId: string) => {
    const { data } = await api.post(`/users/${userId}/follow`)
    return data as { following: boolean }
  },

  unfollow: async (userId: string) => {
    const { data } = await api.delete(`/users/${userId}/follow`)
    return data as { following: boolean }
  },

  likeRide: async (rideId: string) => {
    const { data } = await api.post(`/rides/${rideId}/like`)
    return data as { liked: boolean; total_likes: number }
  },

  commentRide: async (rideId: string, content: string) => {
    const { data } = await api.post(`/rides/${rideId}/comments`, { content })
    return data as { id: string; content: string; created_at: string }
  },

  getProfile: async (userId: string) => {
    const { data } = await api.get(`/users/${userId}`)
    return data as User & { total_rides: number; total_km: number; is_following: boolean }
  },
}
```

### 4.6 Leaderboard service

```typescript
// services/leaderboard.service.ts
import { api } from './api'
import { LeaderboardEntry, VehicleType } from '../types'

export const leaderboardService = {
  getGlobal: async (params?: { vehicle_type?: VehicleType; page?: number }) => {
    const { data } = await api.get('/leaderboard', { params })
    return data as { data: LeaderboardEntry[]; my_rank: LeaderboardEntry | null; period_start: string }
  },

  getFriends: async (params?: { vehicle_type?: VehicleType }) => {
    const { data } = await api.get('/leaderboard/friends', { params })
    return data as { data: LeaderboardEntry[]; my_rank: LeaderboardEntry | null }
  },
}
```

---

## 5. Stores (Global State)

### 5.1 Auth store

```typescript
// stores/auth.store.ts
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

  setAuth: async (user, access, refresh) => {
    await SecureStore.setItemAsync('access_token', access)
    await SecureStore.setItemAsync('refresh_token', refresh)
    set({ user, accessToken: access, isAuthenticated: true })
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token')
    await SecureStore.deleteItemAsync('refresh_token')
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  loadFromStorage: async () => {
    const token = await SecureStore.getItemAsync('access_token')
    if (!token) return false
    set({ accessToken: token, isAuthenticated: true })
    return true
  },
}))
```

### 5.2 Ride store (state saat recording aktif)

```typescript
// stores/ride.store.ts
import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { VehicleType } from '../types'

interface LiveMetrics {
  distance_km: number
  duration_seconds: number
  max_speed_kmh: number
  avg_speed_kmh: number
  calories: number
  elevation_m: number
}

interface RideStore {
  activeRideId: string | null
  wsToken: string | null
  vehicleType: VehicleType | null
  metrics: LiveMetrics
  polylinePoints: { lat: number; lng: number }[]
  isRecording: boolean
  startRide: (rideId: string, wsToken: string, vehicleType: VehicleType) => Promise<void>
  updateMetrics: (update: Partial<LiveMetrics>) => void
  addPoint: (point: { lat: number; lng: number }) => void
  stopRide: () => Promise<void>
}

const EMPTY_METRICS: LiveMetrics = {
  distance_km: 0, duration_seconds: 0, max_speed_kmh: 0,
  avg_speed_kmh: 0, calories: 0, elevation_m: 0,
}

export const useRideStore = create<RideStore>((set) => ({
  activeRideId: null,
  wsToken: null,
  vehicleType: null,
  metrics: EMPTY_METRICS,
  polylinePoints: [],
  isRecording: false,

  startRide: async (rideId, wsToken, vehicleType) => {
    await SecureStore.setItemAsync('active_ride_id', rideId)
    set({ activeRideId: rideId, wsToken, vehicleType, isRecording: true, metrics: EMPTY_METRICS, polylinePoints: [] })
  },

  updateMetrics: (update) => set((s) => ({ metrics: { ...s.metrics, ...update } })),

  addPoint: (point) => set((s) => ({
    polylinePoints: [...s.polylinePoints, point].slice(-500), // max 500 points di memori
  })),

  stopRide: async () => {
    await SecureStore.deleteItemAsync('active_ride_id')
    set({ activeRideId: null, wsToken: null, vehicleType: null, isRecording: false, metrics: EMPTY_METRICS, polylinePoints: [] })
  },
}))
```

---

## 6. Hooks

### 6.1 useAuth

```typescript
// hooks/useAuth.ts
import { useAuthStore } from '../stores/auth.store'
import { authService } from '../services/auth.service'

export function useAuth() {
  const store = useAuthStore()

  const register = async (payload: {
    username: string; email: string; password: string; display_name: string
  }) => {
    const result = await authService.register(payload)
    await store.setAuth(result.user, result.access_token, result.refresh_token)
    return result.user
  }

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password)
    await store.setAuth(result.user, result.access_token, result.refresh_token)
    return result.user
  }

  const logout = async () => {
    try { await authService.logout() } catch {}
    await store.logout()
  }

  // Panggil di root layout saat app launch
  const restoreSession = async (): Promise<boolean> => {
    const hasToken = await store.loadFromStorage()
    if (!hasToken) return false
    try {
      const user = await authService.getMe()
      useAuthStore.setState({ user })
      return true
    } catch {
      await store.logout()
      return false
    }
  }

  return { user: store.user, isAuthenticated: store.isAuthenticated, register, login, logout, restoreSession }
}
```

### 6.2 useGPS

```typescript
// hooks/useGPS.ts
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import * as Linking from 'expo-linking'
import { Alert } from 'react-native'
import { GPSBuffer } from '../utils/gpsBuffer'

export const LOCATION_TASK = 'trackride-background-location'

// WAJIB di top-level modul, di luar komponen apapun
TaskManager.defineTask(LOCATION_TASK, ({ data, error }: any) => {
  if (error || !data?.locations?.length) return
  const loc = data.locations[0]
  const rideId = (global as any).__activeRideId
  if (rideId) GPSBuffer.addRaw(rideId, loc)
})

export function useGPS() {
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
    await Location.requestBackgroundPermissionsAsync()
    return true
  }

  const startTracking = async (rideId: string) => {
    const granted = await requestPermissions()
    if (!granted) throw new Error('PERMISSION_DENIED')
    ;(global as any).__activeRideId = rideId

    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 5000,      // kirim tiap 5 detik
      distanceInterval: 10,    // atau setiap 10 meter
      foregroundService: {
        notificationTitle: 'TrackRide sedang merekam',
        notificationBody: 'Tap untuk kembali ke app',
      },
      pausesUpdatesAutomatically: false,
    })
  }

  const stopTracking = async () => {
    ;(global as any).__activeRideId = null
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK)
    if (isRegistered) await Location.stopLocationUpdatesAsync(LOCATION_TASK)
  }

  const getCurrentLocation = async () =>
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation })

  return { startTracking, stopTracking, getCurrentLocation, requestPermissions }
}
```

### 6.3 useWebSocket

```typescript
// hooks/useWebSocket.ts
import { useRef, useState, useCallback, useEffect } from 'react'
import { GPSBuffer } from '../utils/gpsBuffer'
import { useRideStore } from '../stores/ride.store'

type WSStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export function useRideWebSocket(rideId: string | null, wsToken: string | null) {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>()
  const reconnectAttempts = useRef(0)
  const [status, setStatus] = useState<WSStatus>('disconnected')
  const addPoint = useRideStore((s) => s.addPoint)
  const updateMetrics = useRideStore((s) => s.updateMetrics)

  const flushBuffer = useCallback(async () => {
    if (!rideId || ws.current?.readyState !== WebSocket.OPEN) return
    const pending = await GPSBuffer.getUnsyncedForRide(rideId)
    for (const p of pending) ws.current.send(JSON.stringify({ type: 'gps_point', ...p }))
    if (pending.length) await GPSBuffer.markSynced(pending.map((p: any) => p.id))
  }, [rideId])

  const connect = useCallback(() => {
    if (!rideId || !wsToken) return
    setStatus('connecting')
    ws.current = new WebSocket(`${process.env.EXPO_PUBLIC_WS_URL}/rides/${rideId}/stream?token=${wsToken}`)

    ws.current.onopen = () => {
      setStatus('connected')
      reconnectAttempts.current = 0
      flushBuffer()
    }

    ws.current.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'ack' && msg.current_distance_km != null)
          updateMetrics({ distance_km: msg.current_distance_km })
      } catch {}
    }

    ws.current.onclose = () => {
      setStatus('disconnected')
      const delay = Math.min(2000 * 2 ** reconnectAttempts.current, 30000)
      reconnectAttempts.current++
      reconnectTimer.current = setTimeout(connect, delay)
    }

    ws.current.onerror = () => { setStatus('error'); ws.current?.close() }
  }, [rideId, wsToken, flushBuffer])

  const sendGPSPoint = useCallback((point: {
    lat: number; lng: number; speed_kmh: number; elevation_m: number; timestamp: string
  }) => {
    addPoint({ lat: point.lat, lng: point.lng })
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'gps_point', ...point }))
    } else {
      GPSBuffer.add(rideId!, point)
    }
  }, [rideId])

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimer.current)
    ws.current?.close()
    ws.current = null
    setStatus('disconnected')
  }, [])

  useEffect(() => {
    if (rideId && wsToken) connect()
    return () => { clearTimeout(reconnectTimer.current); ws.current?.close() }
  }, [rideId, wsToken])

  return { status, sendGPSPoint, disconnect }
}
```

### 6.4 useShareCard

```typescript
// hooks/useShareCard.ts
import { useState } from 'react'
import { Skia } from '@shopify/react-native-skia'
import * as MediaLibrary from 'expo-media-library'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { VEHICLE_CONFIG } from '../constants/vehicles'
import { decodePolyline } from '../utils/polyline'
import { formatDuration } from '../utils/metrics'
import { Ride } from '../types'

export function useShareCard() {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateAndShare = async (ride: Ride) => {
    setIsGenerating(true)
    try {
      const W = 1080, H = 1920
      const cfg = VEHICLE_CONFIG[ride.vehicle.type]
      const surface = Skia.Surface.Make(W, H)!
      const canvas = surface.getCanvas()
      const paint = Skia.Paint()

      // Layer 0 — Background
      paint.setColor(Skia.Color(cfg.bgColor))
      canvas.drawRect(Skia.XYWHRect(0, 0, W, H), paint)

      // Layer 1 — Polyline
      const encoded = ride.route_summary?.polyline
      if (encoded) {
        const pts = decodePolyline(encoded, W, H)
        const offsetY = H * 0.22

        if (pts.length > 1) {
          const glowPaint = Skia.Paint()
          glowPaint.setColor(Skia.Color(cfg.color + '33'))
          glowPaint.setStrokeWidth(18)
          glowPaint.setStyle(1)

          const linePaint = Skia.Paint()
          linePaint.setColor(Skia.Color(cfg.color))
          linePaint.setStrokeWidth(7)
          linePaint.setStyle(1)
          linePaint.setStrokeCap(1)
          linePaint.setStrokeJoin(1)

          const path = Skia.Path.Make()
          path.moveTo(pts[0].x, pts[0].y + offsetY)
          for (let i = 1; i < pts.length; i++) {
            const mx = (pts[i-1].x + pts[i].x) / 2
            const my = (pts[i-1].y + pts[i].y) / 2 + offsetY
            path.quadTo(pts[i-1].x, pts[i-1].y + offsetY, mx, my)
          }

          canvas.drawPath(path, glowPaint)
          canvas.drawPath(path, linePaint)

          paint.setColor(Skia.Color(cfg.color + '66'))
          canvas.drawCircle(pts[0].x, pts[0].y + offsetY, 14, paint)
          paint.setColor(Skia.Color(cfg.color))
          canvas.drawCircle(pts[pts.length-1].x, pts[pts.length-1].y + offsetY, 18, paint)
        }
      }

      // Layer 2 — Header teks
      const titleFont = Skia.Font(undefined, 56)
      const subFont = Skia.Font(undefined, 30)
      paint.setColor(Skia.Color('#FFFFFF'))
      canvas.drawText(ride.title ?? 'Perjalanan', 60, 110, paint, titleFont)
      paint.setColor(Skia.Color('#FFFFFF88'))
      canvas.drawText(
        new Date(ride.started_at).toLocaleDateString('id-ID', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        }),
        60, 158, paint, subFont
      )

      // Layer 3 — Metric card
      const cardBg = Skia.Paint()
      cardBg.setColor(Skia.Color('#0000008C'))
      canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(48, H - 480, W - 96, 210), 20, 20), cardBg)

      const valFont = Skia.Font(undefined, 52)
      const lblFont = Skia.Font(undefined, 26)
      const activeMetrics = buildMetricValues(ride)
      const cellW = (W - 96) / activeMetrics.length

      activeMetrics.forEach((m, i) => {
        const x = 48 + cellW * i + 24
        paint.setColor(Skia.Color(i === 0 ? cfg.color : '#FFFFFF'))
        canvas.drawText(`${m.value}${m.unit}`, x, H - 420, paint, valFont)
        paint.setColor(Skia.Color('#FFFFFF55'))
        canvas.drawText(m.label, x, H - 360, paint, lblFont)
      })

      // Layer 4 — Logo
      const logoFont = Skia.Font(undefined, 28)
      paint.setColor(Skia.Color('#FFFFFF88'))
      canvas.drawText('TRACKRIDE', W - 260, H - 60, paint, logoFont)
      paint.setColor(Skia.Color(cfg.color))
      canvas.drawCircle(W - 278, H - 72, 10, paint)

      // Export & share
      const image = surface.makeImageSnapshot()
      const base64 = image.encodeToBase64()
      const tempUri = `${FileSystem.cacheDirectory}ride_${ride.id}.png`

      await FileSystem.writeAsStringAsync(tempUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      })

      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status === 'granted') await MediaLibrary.saveToLibraryAsync(tempUri)

      await Sharing.shareAsync(tempUri, {
        mimeType: 'image/png',
        dialogTitle: 'Bagikan ke Instagram Story',
        UTI: 'public.png',
      })

      await FileSystem.deleteAsync(tempUri, { idempotent: true })
    } finally {
      setIsGenerating(false)
    }
  }

  return { generateAndShare, isGenerating }
}

function buildMetricValues(ride: Ride) {
  const t = ride.vehicle.type
  if (t === 'motor') return [
    { value: ride.max_speed_kmh.toFixed(0), unit: ' km/h', label: 'kec. maks' },
    { value: ride.distance_km.toFixed(1),   unit: ' km',   label: 'jarak' },
    { value: formatDuration(ride.duration_seconds), unit: '', label: 'durasi' },
  ]
  if (t === 'mobil') return [
    { value: ride.distance_km.toFixed(1),   unit: ' km',  label: 'jarak' },
    { value: ride.route_summary?.cities?.join('→') ?? '-', unit: '', label: 'rute kota' },
    { value: formatDuration(ride.duration_seconds), unit: '', label: 'durasi' },
  ]
  return [
    { value: String(ride.calories),                     unit: ' kal', label: 'kalori*' },
    { value: ride.distance_km.toFixed(1),               unit: ' km',  label: 'jarak' },
    { value: String(Math.round(ride.elevation_m)),      unit: ' m',   label: 'elevasi' },
  ]
}
```

### 6.5 useNotifications

```typescript
// hooks/useNotifications.ts
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { api } from '../services/api'

// Setup di top-level (luar komponen)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// Panggil setelah user selesai tambah kendaraan pertama — bukan saat install
export async function registerForPushNotifications(): Promise<string | null> {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return null

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  const token = await Notifications.getExpoPushTokenAsync({ projectId })
  await api.put('/users/me', { push_token: token.data })
  return token.data
}
```

---

## 7. Utils

### 7.1 Polyline

```typescript
// utils/polyline.ts
import Polyline from '@mapbox/polyline'

/**
 * Decode encoded polyline → koordinat {x, y} siap di-draw ke Skia canvas.
 * Polyline dinormalisasi ke dalam batas canvasW × (canvasH * 0.5) dengan padding.
 */
export function decodePolyline(
  encoded: string,
  canvasW: number,
  canvasH: number,
  padding = 120
): { x: number; y: number }[] {
  const latLngs = Polyline.decode(encoded)
  if (!latLngs.length) return []

  const lats = latLngs.map(p => p[0])
  const lngs = latLngs.map(p => p[1])
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const rangeW = maxLng - minLng || 0.001
  const rangeH = maxLat - minLat || 0.001
  const drawH = canvasH * 0.5

  const scale = Math.min((canvasW - padding * 2) / rangeW, (drawH - padding * 2) / rangeH)
  const offsetX = (canvasW - rangeW * scale) / 2
  const offsetY = (drawH - rangeH * scale) / 2

  return latLngs.map(([lat, lng]) => ({
    x: (lng - minLng) * scale + offsetX,
    y: drawH - ((lat - minLat) * scale + offsetY),
  }))
}

/**
 * Downsample array ke maxPoints titik.
 * Pakai sebelum render polyline di peta live (max 500).
 */
export function downsamplePoints<T>(points: T[], maxPoints: number): T[] {
  if (points.length <= maxPoints) return points
  const factor = Math.ceil(points.length / maxPoints)
  return points.filter((_, i) => i % factor === 0)
}
```

### 7.2 Metrics

```typescript
// utils/metrics.ts

/** Format detik → "H:MM:SS" atau "MM:SS" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Format km — tampilkan meter jika < 1km */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

/**
 * Estimasi kalori (sepeda) — MET-based (Howarth et al., 2021).
 * Tampilkan dengan label "estimasi" di UI — akurasi ±15% tanpa sensor HR.
 */
export function estimateCalories(distanceKm: number, durationMinutes: number, weightKg = 70): number {
  const avgSpeed = durationMinutes > 0 ? (distanceKm / durationMinutes) * 60 : 0
  const met = avgSpeed < 15 ? 6.0 : avgSpeed < 20 ? 8.0 : 10.0
  return Math.round(met * weightKg * (durationMinutes / 60))
}

/** Jarak antara dua koordinat GPS dalam km (Haversine) */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
```

### 7.3 GPS Buffer (SQLite offline)

```typescript
// utils/gpsBuffer.ts
import * as SQLite from 'expo-sqlite'

const db = SQLite.openDatabaseSync('trackride_gps.db')
db.execSync(`
  CREATE TABLE IF NOT EXISTS gps_buffer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id TEXT NOT NULL,
    lat REAL NOT NULL, lng REAL NOT NULL,
    speed_kmh REAL DEFAULT 0, elevation_m REAL DEFAULT 0,
    timestamp TEXT NOT NULL,
    synced INTEGER DEFAULT 0
  )
`)

export const GPSBuffer = {
  /** Dari background task — raw Location object */
  addRaw: (rideId: string, loc: { coords: { latitude: number; longitude: number; speed: number | null; altitude: number | null }; timestamp: number }) => {
    db.runSync(
      `INSERT INTO gps_buffer (ride_id, lat, lng, speed_kmh, elevation_m, timestamp) VALUES (?,?,?,?,?,?)`,
      [rideId, loc.coords.latitude, loc.coords.longitude, (loc.coords.speed ?? 0) * 3.6, loc.coords.altitude ?? 0, new Date(loc.timestamp).toISOString()]
    )
  },

  /** Format sudah diparse */
  add: (rideId: string, point: { lat: number; lng: number; speed_kmh: number; elevation_m: number; timestamp: string }) => {
    db.runSync(
      `INSERT INTO gps_buffer (ride_id, lat, lng, speed_kmh, elevation_m, timestamp) VALUES (?,?,?,?,?,?)`,
      [rideId, point.lat, point.lng, point.speed_kmh, point.elevation_m, point.timestamp]
    )
  },

  getUnsyncedForRide: (rideId: string) =>
    db.getAllSync(`SELECT * FROM gps_buffer WHERE ride_id=? AND synced=0 ORDER BY timestamp ASC`, [rideId]),

  markSynced: (ids: number[]) => {
    if (!ids.length) return
    db.runSync(`UPDATE gps_buffer SET synced=1 WHERE id IN (${ids.join(',')})`)
  },

  clearForRide: (rideId: string) =>
    db.runSync(`DELETE FROM gps_buffer WHERE ride_id=?`, [rideId]),
}
```

---

## 8. Deep Link Setup

```json
// app.json
{
  "expo": {
    "scheme": "trackride",
    "ios": { "associatedDomains": ["applinks:trackride.app"] },
    "android": {
      "intentFilters": [{
        "action": "VIEW",
        "data": [{ "scheme": "https", "host": "trackride.app" }],
        "category": ["BROWSABLE", "DEFAULT"]
      }]
    }
  }
}
```

```typescript
// Konfigurasi linking di root navigation
export const linking = {
  prefixes: ['trackride://', 'https://trackride.app'],
  config: {
    screens: {
      Profile: 'u/:username',
      RideDetail: 'rides/:rideId',
    },
  },
}
```

---

## 9. Restore ride saat app di-kill

```typescript
// Letakkan di root layout, panggil saat app launch
import * as SecureStore from 'expo-secure-store'

export async function checkUnfinishedRide(): Promise<string | null> {
  return SecureStore.getItemAsync('active_ride_id')
}
// Non-null → arahkan ke RecordingScreen dengan rideId,
// tawarkan opsi "Lanjutkan" atau "Akhiri perjalanan"
```

---

## 10. Performance Notes

| Concern | Solusi |
|---|---|
| Battery drain GPS | `timeInterval: 5000` + `distanceInterval: 10` |
| Polyline di peta live | `downsamplePoints(points, 500)` sebelum render |
| Share card render | Skia ~200–400ms — tampilkan `isGenerating` state |
| WebSocket reconnect | Exponential backoff: 2s → 4s → 8s → max 30s |

---

*TrackRide Frontend Guide v1.0 — Last updated: April 2026*
*Untuk backend & API, lihat `CLAUDE-backend.md`*

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
