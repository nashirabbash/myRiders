/**
 * Global app configuration
 * Contains constants, settings, and default values
 */

// App info
export const APP_CONFIG = {
  name: 'TrackRide',
  version: '1.0.0',
  minOSVersionIOS: '15.0',
  minOSVersionAndroid: '10',
}

// GPS tracking configuration
export const GPS_CONFIG = {
  timeInterval: 5000, // milliseconds - send GPS update every 5 seconds
  distanceInterval: 10, // meters - or when moved 10 meters
}

// Default values
export const DEFAULTS = {
  weightKg: 70, // default weight for calorie calculations
}
