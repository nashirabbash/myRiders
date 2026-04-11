import { ThemedView } from "@/components/themed-view";
import { Button, Input } from "heroui-native";
import React, { useState } from "react";
import { ScrollView } from "react-native";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleSignUp = () => {
    console.log({ email, password, displayName });
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20,
        gap: 16,
        justifyContent: "center",
      }}
    >
      <ThemedView>
        <Input
          placeholder="Enter your name"
          value={displayName}
          onChangeText={setDisplayName}
        />
      </ThemedView>

      <ThemedView>
        <Input
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </ThemedView>

      <ThemedView>
        <Input
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </ThemedView>

      <Button variant="primary" onPress={handleSignUp}>
        CREATE ACCOUNT
      </Button>
    </ScrollView>
  );
}
