import { Ionicons } from "@expo/vector-icons";
import { BottomSheet, Button, ListGroup, useThemeColor } from "heroui-native";
import React from "react";
import { View } from "react-native";
import { VEHICLE_CONFIG } from "../../src/constants/vehicles";
import type { VehicleType } from "../../src/types";

interface VehicleSelectTemplateProps {
  onSelect?: (vehicleType: VehicleType) => void;
}

/**
 * Vehicle selection template using VEHICLE_CONFIG mapping with icons
 */
export default function VehicleSelectTemplate({
  onSelect,
}: VehicleSelectTemplateProps) {
  const [themeColorAccentForeground] = useThemeColor([
    "accent-foreground",
    "accent-soft-foreground",
    "danger-foreground",
    "default-foreground",
  ]);

  const vehicleIcons: Record<VehicleType, string> = {
    motor: "bicycle",
    mobil: "car",
    sepeda: "fitness",
  };

  return (
    <BottomSheet>
      <BottomSheet.Trigger asChild>
        <Button isIconOnly variant="secondary">
          <Ionicons name="scan" size={24} color={themeColorAccentForeground} />
        </Button>
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content>
          <ListGroup>
            {(Object.entries(VEHICLE_CONFIG) as [VehicleType, typeof VEHICLE_CONFIG[VehicleType]][]).map(
              ([vehicleType, config]) => (
                <ListGroup.Item
                  key={vehicleType}
                  onPress={() => onSelect?.(vehicleType)}
                >
                  <ListGroup.ItemContent>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Ionicons
                        name={vehicleIcons[vehicleType]}
                        size={20}
                        color={config.color}
                      />
                      <ListGroup.ItemTitle>{config.label}</ListGroup.ItemTitle>
                    </View>
                  </ListGroup.ItemContent>
                </ListGroup.Item>
              )
            )}
          </ListGroup>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
