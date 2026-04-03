import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import RNMapView, {
  PROVIDER_GOOGLE,
  Polyline,
  Marker,
  type MapViewProps,
  type MapMarkerProps,
  type MapPolylineProps,
  type Region,
  type LatLng,
} from "react-native-maps";

// Re-export types so consumers don't import from react-native-maps directly
export type { Region, LatLng, MapViewProps, MapMarkerProps, MapPolylineProps };

export type MapViewRef = InstanceType<typeof RNMapView>;

/**
 * App-wide MapView wrapper — always uses Google Maps on both Android and iOS.
 *
 * Usage:
 *   <MapView initialRegion={...} style={styles.map} />
 *
 * For route replay:
 *   <MapView>
 *     <RoutePolyline coordinates={points} />
 *   </MapView>
 */
const MapView = forwardRef<MapViewRef, MapViewProps>(
  ({ style, children, ...props }, ref) => (
    <RNMapView
      ref={ref}
      provider={PROVIDER_GOOGLE}
      style={[styles.fill, style]}
      showsUserLocation
      showsMyLocationButton={false}
      toolbarEnabled={false}
      {...props}
    >
      {children}
    </RNMapView>
  )
);

MapView.displayName = "MapView";

export default MapView;

// ─── Convenience sub-components ───────────────────────────────────────────────

/**
 * Renders a GPS route as a coloured polyline on the map.
 */
export function RoutePolyline({
  coordinates,
  color = "#2563EB",
  width = 4,
  ...props
}: {
  coordinates: LatLng[];
  color?: string;
  width?: number;
} & Omit<MapPolylineProps, "coordinates">) {
  if (coordinates.length < 2) return null;
  return (
    <Polyline
      coordinates={coordinates}
      strokeColor={color}
      strokeWidth={width}
      geodesic
      {...props}
    />
  );
}

/**
 * Renders start and end pin markers for a trip route.
 */
export function TripEndpoints({
  start,
  end,
}: {
  start: LatLng;
  end?: LatLng;
}) {
  return (
    <>
      <Marker coordinate={start} title="Start" pinColor="#22C55E" />
      {end && <Marker coordinate={end} title="End" pinColor="#EF4444" />}
    </>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
