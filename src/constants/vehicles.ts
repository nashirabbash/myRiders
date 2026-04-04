/**
 * Vehicle Configuration Constants
 * Centralized configuration for vehicle-specific UI and metric settings
 */

export const VEHICLE_CONFIG = {
  motor: {
    label: 'Motor',
    color: '#4ADE80',
    bgColor: '#0A1F0A',
    metrics: [
      { key: 'max_speed_kmh', label: 'Kec. maks', unit: 'km/h', highlight: true },
      { key: 'distance_km', label: 'Jarak', unit: 'km' },
      { key: 'duration', label: 'Durasi', unit: '' },
    ],
  },
  mobil: {
    label: 'Mobil',
    color: '#60A5FA',
    bgColor: '#0A1428',
    metrics: [
      { key: 'distance_km', label: 'Jarak', unit: 'km', highlight: true },
      { key: 'cities', label: 'Rute kota', unit: '' },
      { key: 'duration', label: 'Durasi', unit: '' },
    ],
  },
  sepeda: {
    label: 'Sepeda',
    color: '#FBBF24',
    bgColor: '#1A0F00',
    metrics: [
      { key: 'calories', label: 'Kalori', unit: 'kal', highlight: true },
      { key: 'distance_km', label: 'Jarak', unit: 'km' },
      { key: 'elevation_m', label: 'Elevasi', unit: 'm' },
    ],
  },
} as const
