import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Button, Card, useThemeColor } from "heroui-native";
import React, { useCallback, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";
import Map, { type MapViewRef } from "../ui/Map";

const stats = [
  { label: "Speed", value: "82", unit: "km/h" },
  { label: "Distance", value: "12", unit: "km" },
  { label: "Duration", value: "24", unit: "min" },
];

export default function Maps() {
  const [themeColorAccentForeground] = useThemeColor([
    "accent-foreground",
    "accent-soft-foreground",
    "danger-foreground",
    "default-foreground",
  ]);
  const mapRef = useRef<MapViewRef>(null);
  const [isActive, setIsActive] = useState(false);

  const centerCamera = useCallback(
    (latitude: number, longitude: number, animate = true) => {
      if (!mapRef.current) return;

      mapRef.current.animateCamera(
        {
          center: { latitude, longitude },
          zoom: 17,
          heading: 0,
          pitch: 0,
        },
        animate ? { duration: 700 } : undefined,
      );
    },
    [],
  );

  const focusOnCurrentLocation = useCallback(
    async (animate = true) => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (permission.status !== Location.PermissionStatus.GRANTED) {
          Alert.alert(
            "Location permission required",
            "Allow location access to center the map on your position.",
          );
          return;
        }

        const currentPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        centerCamera(
          currentPosition.coords.latitude,
          currentPosition.coords.longitude,
          animate,
        );
      } catch {
        Alert.alert(
          "Unable to get location",
          "Please make sure GPS is enabled and try again.",
        );
      }
    },
    [centerCamera],
  );

  return (
    <View style={{ flex: 1 }}>
      <Map
        ref={mapRef}
        style={{ flex: 1 }}
        followsUserLocation
        onMapReady={() => {
          void focusOnCurrentLocation(false);
        }}
      />
      <View className="absolute bottom-0 w-full p-2 gap-4">
        <View style={styles.floatingButtonWrap}>
          <Button
            isIconOnly
            size="lg"
            onPress={() => {
              void focusOnCurrentLocation();
            }}
          >
            <Ionicons
              name="locate"
              size={22}
              color={themeColorAccentForeground}
            />
          </Button>
        </View>
        {isActive && (
          <Card>
            <Card.Body>
              <View style={styles.statsRow}>
                {stats.map((item) => (
                  <View key={item.label} style={styles.metricColumn}>
                    <View style={styles.metricValueRow}>
                      <ThemedText style={styles.metricValue}>
                        {item.value}
                      </ThemedText>
                      <ThemedText style={styles.metricUnit}>
                        {item.unit}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.metricLabel}>
                      {item.label}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </Card.Body>
          </Card>
        )}
        <Card className="w-full">
          <Card.Body className="pt-4">
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: !isActive ? "space-between" : "center",
                gap: 12,
              }}
            >
              {/* device parse button */}
              {!isActive && (
                <Button isIconOnly variant="secondary">
                  <Ionicons
                    name="scan"
                    size={24}
                    color={themeColorAccentForeground}
                  />
                </Button>
              )}
              {/* start button */}
              {!isActive ? (
                <Button
                  isIconOnly
                  size="lg"
                  onPress={() => setIsActive(!isActive)}
                >
                  <Ionicons
                    name="play"
                    size={24}
                    color={themeColorAccentForeground}
                  />
                </Button>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  {/* continue button */}
                  <Button
                    isIconOnly
                    size="lg"
                    onPress={() => setIsActive(!isActive)}
                    variant="secondary"
                  >
                    <Ionicons
                      name="pause"
                      size={24}
                      color={themeColorAccentForeground}
                    />
                  </Button>
                  {/* stop button */}
                  <Button
                    isIconOnly
                    size="lg"
                    onPress={() => setIsActive(!isActive)}
                    variant="danger"
                  >
                    <Ionicons
                      name="stop"
                      size={24}
                      color={themeColorAccentForeground}
                    />
                  </Button>
                </View>
              )}
              {/* spotify connect button */}
              {!isActive && (
                <Button isIconOnly variant="secondary">
                  <Ionicons
                    name="musical-notes"
                    size={24}
                    color={themeColorAccentForeground}
                  />
                </Button>
              )}
            </View>
          </Card.Body>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingButtonWrap: {
    alignSelf: "flex-end",
    marginRight: 4,
  },
  statsPanel: {
    borderWidth: 2,
    borderColor: "#1d1d1d",
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  metricColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 3,
  },
  metricValue: {
    fontSize: 38,
    lineHeight: 40,
    fontWeight: 600,
    letterSpacing: -0.7,
  },
  metricUnit: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 500,
  },
  metricLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 500,
    marginTop: 2,
  },
});
