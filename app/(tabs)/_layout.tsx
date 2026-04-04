import { Tabs, useRouter } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import Toolbars from "@/components/ui/Toolbars";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";

const tabsItems = [
  {
    id: 1,
    name: "index",
    title: "Home",
    icon: "home-sharp",
  },
  {
    id: 2,
    name: "record",
    title: "Record",
    icon: "radio-button-on-sharp",
  },
  {
    id: 3,
    name: "activity",
    title: "Activity",
    icon: "stats-chart-sharp",
  },
];

export default function TabLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colorSchemeKey = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[colorSchemeKey];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.background,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {tabsItems.map((item) => (
        <Tabs.Screen
          key={item.id}
          name={item.name}
          listeners={
            item.id === 2
              ? {
                  tabPress: (event) => {
                    event.preventDefault();
                    router.push("/(screens)/record");
                  },
                }
              : undefined
          }
          options={{
            title: item.title,
            headerTitleAlign: item.id === 2 ? "center" : "left",
            headerRight: item.id === 2 ? undefined : () => <Toolbars />,
            tabBarShowLabel: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
