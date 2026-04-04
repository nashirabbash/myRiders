/**
 * GPS Buffer utility - SQLite-backed offline GPS point buffering
 * Persists raw and normalized GPS points for offline rides or WebSocket reconnects
 * Separate database from main app (trackride_gps.db)
 */

import * as SQLite from 'expo-sqlite'

// Singleton database instance
let db: SQLite.SQLiteDatabase | null = null

/**
 * Initialize GPS buffer database
 * Creates trackride_gps.db and gps_buffer table if they don't exist
 */
function initDb(): SQLite.SQLiteDatabase {
  if (db) return db

  db = SQLite.openDatabaseSync('trackride_gps.db')

  // Create table if not exists
  db.execSync(`
    CREATE TABLE IF NOT EXISTS gps_buffer (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ride_id TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      speed_kmh REAL DEFAULT 0,
      elevation_m REAL DEFAULT 0,
      timestamp TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    )
  `)

  return db
}

/**
 * Add raw GPS point from background location task
 * Converts raw Expo Location format to normalized GPS point
 * @param rideId - Active ride ID
 * @param loc - Raw location object from Expo background task
 */
export function addRaw(
  rideId: string,
  loc: {
    coords: {
      latitude: number
      longitude: number
      speed: number | null
      altitude: number | null
    }
    timestamp: number
  }
): void {
  const database = initDb()
  const speed = (loc.coords.speed ?? 0) * 3.6 // m/s to km/h
  const elevation = loc.coords.altitude ?? 0
  const timestamp = new Date(loc.timestamp).toISOString()

  database.runSync(
    `INSERT INTO gps_buffer (ride_id, lat, lng, speed_kmh, elevation_m, timestamp)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [rideId, loc.coords.latitude, loc.coords.longitude, speed, elevation, timestamp]
  )
}

/**
 * Add normalized GPS point (already formatted for sync)
 * @param rideId - Active ride ID
 * @param point - GPS point with decimal lat/lng and km/h speed
 */
export function add(
  rideId: string,
  point: {
    lat: number
    lng: number
    speed_kmh: number
    elevation_m: number
    timestamp: string
  }
): void {
  const database = initDb()

  database.runSync(
    `INSERT INTO gps_buffer (ride_id, lat, lng, speed_kmh, elevation_m, timestamp)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [rideId, point.lat, point.lng, point.speed_kmh, point.elevation_m, point.timestamp]
  )
}

/**
 * Get all unsynced points for a ride (in timestamp order)
 * @param rideId - Ride ID to query
 * @returns Array of unsync points with id field
 */
export function getUnsyncedForRide(rideId: string): any[] {
  const database = initDb()

  return database.getAllSync(
    `SELECT * FROM gps_buffer
     WHERE ride_id = ? AND synced = 0
     ORDER BY timestamp ASC`,
    [rideId]
  )
}

/**
 * Mark points as synced after successful flush to backend
 * @param ids - Array of point IDs to mark as synced (guards against empty array)
 */
export function markSynced(ids: number[]): void {
  if (ids.length === 0) return // Guard: prevent invalid SQL

  const database = initDb()
  const placeholders = ids.map(() => '?').join(',')

  database.runSync(
    `UPDATE gps_buffer SET synced = 1 WHERE id IN (${placeholders})`,
    ids
  )
}

/**
 * Clear all buffered points for a ride (cleanup after ride complete)
 * @param rideId - Ride ID to clear
 */
export function clearForRide(rideId: string): void {
  const database = initDb()

  database.runSync(`DELETE FROM gps_buffer WHERE ride_id = ?`, [rideId])
}

// Export as object for convenient access (e.g., GPSBuffer.add, GPSBuffer.getUnsyncedForRide)
export const GPSBuffer = {
  addRaw,
  add,
  getUnsyncedForRide,
  markSynced,
  clearForRide,
}
