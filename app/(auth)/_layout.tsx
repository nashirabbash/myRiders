import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          presentation: "formSheet",
          sheetAllowedDetents: [0.8, 1],
          animation: "slide_from_bottom",
          sheetCornerRadius: 20,
        }}
      />
    </Stack>
  );
}
