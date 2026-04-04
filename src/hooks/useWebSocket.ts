/**
 * useRideWebSocket - Ride streaming hook
 * Handles WebSocket connection, reconnect with exponential backoff, and GPS buffer flushing
 */

import { useRef, useState, useCallback, useEffect } from 'react'
import { GPSBuffer } from '../utils/gpsBuffer'
import { useRideStore } from '../stores/ride.store'
import { haversineKm } from '../utils/metrics'

type WSStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export function useRideWebSocket(rideId: string | null, wsToken: string | null) {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>()
  const reconnectAttempts = useRef(0)
  const isManuallyDisconnected = useRef(false)
  const lastServerDistance = useRef(0)
  const hasReceivedFirstAck = useRef(false)
  const pendingSync = useRef<{
    ids: number[]
    expectedDistance: number
    flushDistance: number
    acksAfterFlush: number
  } | null>(null)
  const [status, setStatus] = useState<WSStatus>('disconnected')

  const addPoint = useRideStore((s) => s.addPoint)
  const updateMetrics = useRideStore((s) => s.updateMetrics)

  /**
   * Flush buffered GPS points to the server
   * Points are marked synced only after server confirms receipt via ack distance
   * This prevents loss of data if connection drops after send
   */
  const flushBuffer = useCallback(async () => {
    if (!rideId || ws.current?.readyState !== WebSocket.OPEN) return
    // Don't flush until first ack establishes accurate baseline distance
    if (!hasReceivedFirstAck.current) return

    try {
      const pending = await GPSBuffer.getUnsyncedForRide(rideId)
      if (pending.length === 0) return

      // Track IDs for this flush batch
      const batchIds = pending.map((p: any) => p.id)

      // Calculate expected distance increase from this batch
      let batchDistance = 0
      for (let i = 1; i < pending.length; i++) {
        batchDistance += haversineKm(
          pending[i - 1].lat,
          pending[i - 1].lng,
          pending[i].lat,
          pending[i].lng
        )
      }

      // Send all pending points
      for (const point of pending) {
        ws.current?.send(JSON.stringify({ type: 'gps_point', ...point }))
      }

      // Store batch info for sync confirmation when ack arrives
      pendingSync.current = {
        ids: batchIds,
        expectedDistance: batchDistance,
        flushDistance: lastServerDistance.current,
        acksAfterFlush: 0,
      }
    } catch (e) {
      console.error('[WebSocket] Error flushing buffer:', e)
      // On error, leave points unsynced for retry on next reconnect
      pendingSync.current = null
    }
  }, [rideId])

  /**
   * Establish WebSocket connection and set up handlers
   */
  const connect = useCallback(() => {
    if (!rideId || !wsToken) return
    // Don't reconnect if user manually disconnected
    if (isManuallyDisconnected.current) return

    setStatus('connecting')
    // Reset first ack flag for new connection
    hasReceivedFirstAck.current = false
    const wsUrl = `${process.env.EXPO_PUBLIC_WS_URL}/rides/${rideId}/stream?token=${wsToken}`

    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      setStatus('connected')
      reconnectAttempts.current = 0
      flushBuffer()
    }

    ws.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        // Handle ack message: update metrics and confirm buffer synced if distance advanced
        if (msg.type === 'ack' && msg.current_distance_km != null) {
          // Mark baseline distance on first ack so flushBuffer has accurate reference
          if (!hasReceivedFirstAck.current) {
            hasReceivedFirstAck.current = true
            lastServerDistance.current = msg.current_distance_km
            // Trigger flush now that baseline is established
            flushBuffer()
          } else if (pendingSync.current) {
            pendingSync.current.acksAfterFlush++
            const batch = pendingSync.current

            // For batches with movement: confirm when server distance covers the batch
            const distanceConfirmed =
              batch.expectedDistance > 0 &&
              msg.current_distance_km >= batch.flushDistance + batch.expectedDistance

            // For zero-distance batches (single point or stationary): require one ack
            // cycle after flush since distance signal alone cannot confirm delivery
            const ackConfirmed = batch.expectedDistance === 0 && batch.acksAfterFlush >= 1

            if (distanceConfirmed || ackConfirmed) {
              GPSBuffer.markSynced(batch.ids)
              pendingSync.current = null
            }
          }
          updateMetrics({ distance_km: msg.current_distance_km })
          lastServerDistance.current = msg.current_distance_km
        }
      } catch (e) {
        console.error('[WebSocket] Error parsing message:', e)
      }
    }

    ws.current.onclose = () => {
      setStatus('disconnected')
      // Only reconnect if not manually disconnected
      if (isManuallyDisconnected.current) return

      // Exponential backoff: 2s, 4s, 8s, ... max 30s
      const delay = Math.min(2000 * Math.pow(2, reconnectAttempts.current), 30000)
      reconnectAttempts.current++
      reconnectTimer.current = setTimeout(connect, delay)
    }

    ws.current.onerror = () => {
      setStatus('error')
      ws.current?.close()
    }
  }, [rideId, wsToken, flushBuffer, updateMetrics])

  /**
   * Send a GPS point (live or buffer if offline)
   */
  const sendGPSPoint = useCallback(
    (point: {
      lat: number
      lng: number
      speed_kmh: number
      elevation_m: number
      timestamp: string
    }) => {
      // Always update local polyline
      addPoint({ lat: point.lat, lng: point.lng })

      // Send live if connected, buffer if not
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'gps_point', ...point }))
      } else {
        GPSBuffer.add(rideId!, point)
      }
    },
    [rideId, addPoint]
  )

  /**
   * Disconnect WebSocket and stop reconnect attempts
   * Sets flag to prevent automatic reconnection
   */
  const disconnect = useCallback(() => {
    isManuallyDisconnected.current = true
    clearTimeout(reconnectTimer.current)
    if (ws.current) {
      ws.current.close()
      ws.current = null
    }
    setStatus('disconnected')
  }, [])

  /**
   * Connect on mount, disconnect on unmount
   */
  useEffect(() => {
    isManuallyDisconnected.current = false
    if (rideId && wsToken) {
      connect()
    }
    return () => {
      disconnect()
    }
  }, [rideId, wsToken, connect, disconnect])

  return { status, sendGPSPoint, disconnect }
}
