// Utility functions - formatting, geometry, and persistence helpers

// Metrics: formatting and calculation helpers
export { formatDuration, formatDistance, estimateCalories, haversineKm } from './metrics'

// Polyline: route decoding and point normalization
export { decodePolyline, downsamplePoints } from './polyline'

// GPS Buffer: SQLite-backed point persistence
export { GPSBuffer } from './gpsBuffer'
