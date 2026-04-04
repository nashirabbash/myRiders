import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

export default function ScreenLayout() {
  const colorScheme = useColorScheme();
  const colorSchemeKey = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[colorSchemeKey];
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="record"
        options={{
          headerShown: true,
          headerTitleAlign: "center",
          title: "Record",
        }}
      />
    </Stack>
  );
}
