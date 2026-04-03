import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import React from "react";
import { View } from "react-native";

export default function Index() {
  const navigate = useRouter();
  return (
    <ThemedView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        flexDirection: "column",
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
        <Button
          variant="primary"
          className="w-full"
          onPress={() => navigate.replace("/(tabs)")}
        >
          LOGIN
        </Button>
        <Button variant="outline" className="w-full">
          SIGN UP
        </Button>
      </View>
    </ThemedView>
  );
}
