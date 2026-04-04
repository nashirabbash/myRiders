/**
 * Polyline utility - route decoding and point normalization
 * Supports both live map rendering and share card canvas drawing
 */

// @ts-ignore - @mapbox/polyline has no type definitions
import Polyline from '@mapbox/polyline'

/**
 * Decode Google-encoded polyline into drawable canvas points
 * Normalizes coordinates into a target canvas area with padding
 * @param encoded - Encoded polyline string (empty string returns [])
 * @param canvasW - Canvas width in pixels
 * @param canvasH - Canvas height in pixels
 * @param padding - Padding around normalized points (default 120)
 * @returns Array of normalized {x, y} points ready for canvas drawing
 */
export function decodePolyline(
  encoded: string,
  canvasW: number,
  canvasH: number,
  padding = 120
): { x: number; y: number }[] {
  // Guard: empty polyline
  if (!encoded || encoded.length === 0) {
    return []
  }

  try {
    const latLngs = Polyline.decode(encoded)
    if (!latLngs.length) {
      return []
    }

    // Extract lat/lng ranges
    const lats = latLngs.map((p: number[]) => p[0])
    const lngs = latLngs.map((p: number[]) => p[1])
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const rangeW = maxLng - minLng || 0.001 // Avoid division by zero
    const rangeH = maxLat - minLat || 0.001

    // Normalize into canvas area (use half of canvas height)
    const drawH = canvasH * 0.5
    const scale = Math.min(
      (canvasW - padding * 2) / rangeW,
      (drawH - padding * 2) / rangeH
    )

    const offsetX = (canvasW - rangeW * scale) / 2
    const offsetY = (drawH - rangeH * scale) / 2

    // Map to canvas coordinates (invert Y axis)
    return latLngs.map(([lat, lng]: number[]) => ({
      x: (lng - minLng) * scale + offsetX,
      y: drawH - ((lat - minLat) * scale + offsetY),
    }))
  } catch {
    // Invalid polyline format
    return []
  }
}

/**
 * Downsample points to a maximum count while preserving shape
 * Useful for reducing render complexity on live maps (max 500 points)
 * @param points - Array of points to downsample
 * @param maxPoints - Maximum number of points to keep
 * @returns Downsampled array (original if points.length <= maxPoints)
 */
export function downsamplePoints<T>(points: T[], maxPoints: number): T[] {
  if (points.length <= maxPoints) {
    return points
  }
  const factor = Math.ceil(points.length / maxPoints)
  return points.filter((_, i) => i % factor === 0)
}
