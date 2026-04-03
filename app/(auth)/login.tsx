import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { Button } from "heroui-native";
import React from "react";
import { useColorScheme, View } from "react-native";

export default function LoginScreen() {
  const scheme = useColorScheme();
  const colorSchemeKey = scheme === "dark" ? "dark" : "light";
  const colors = Colors[colorSchemeKey];
  return (
    <ThemedView
      style={{
        alignItems: "center",
        height: "100%",
        justifyContent: "flex-end",
        flexDirection: "column",
        backgroundColor: colors.accent,
      }}
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
          gap: 12,
          width: "100%",
          paddingBottom: 40,
        }}
      >
        <Button variant="primary" className="w-full">
          LOGIN
        </Button>
        <Button variant="outline" className="w-full">
          SIGN UP
        </Button>
      </View>
    </ThemedView>
  );
}
