import { Ionicons } from "@expo/vector-icons";
import { Button, useThemeColor } from "heroui-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import Profile from "../screens/profile";

export default function Toolbars() {
  const [
    themeColorAccentForeground,
    themeColorAccentSoftForeground,
    themeColorDangerForeground,
    themeColorDefaultForeground,
  ] = useThemeColor([
    "accent-foreground",
    "accent-soft-foreground",
    "danger-foreground",
    "default-foreground",
  ]);
  return (
    <View style={styles.HeaderRight}>
      <Button isIconOnly variant="ghost" size="md">
        <Ionicons
          name="notifications"
          size={24}
          color={themeColorDangerForeground}
        />
      </Button>
      <Profile />
    </View>
  );
}

const styles = StyleSheet.create({
  HeaderRight: {
    marginRight: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
