import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import React, { useState } from "react";
import { View } from "react-native";

export default function Index() {
  const navigate = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    setIsLoginOpen(false);
    navigate.replace("/(tabs)");
  };

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
        <Button className="w-full" onPress={() => navigate.push("/(tabs)")}>
          LOGIN
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onPress={() => navigate.push("/(auth)/sign-up" as any)}
        >
          SIGN UP
        </Button>
      </View>
    </ThemedView>
  );
}
