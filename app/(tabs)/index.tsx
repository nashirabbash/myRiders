import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "heroui-native";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.View}>
      <Card className="w-full h-[50]">
        <Card.Body>
          <ThemedText>Tes</ThemedText>
        </Card.Body>
      </Card>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  View: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
});
