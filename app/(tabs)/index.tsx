import { FlatList } from "react-native";
import { ThemedView } from "@/components/themed-view";
import FeedPost from "@/components/screens/FeedPost";
import { FeedItem } from "@/src/types";

const MOCK_FEED: FeedItem[] = [
  {
    id: "r1",
    vehicle_id: "v1",
    vehicle_type: "motor",
    vehicle_name: "Honda CBR",
    status: "completed",
    started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    distance_km: 24.5,
    duration_seconds: 3600,
    max_speed_kmh: 98,
    avg_speed_kmh: 65,
    elevation_m: 120,
    calories: 310,
    like_count: 14,
    comment_count: 3,
    user_has_liked: false,
    owner: {
      id: "u1",
      username: "john_doe",
      display_name: "John Doe",
      avatar_url: "https://i.pravatar.cc/150?img=1",
    },
  },
  {
    id: "r2",
    vehicle_id: "v2",
    vehicle_type: "sepeda",
    vehicle_name: "Polygon Siskiu",
    status: "completed",
    started_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    distance_km: 8.2,
    duration_seconds: 1800,
    max_speed_kmh: 34,
    avg_speed_kmh: 18,
    elevation_m: 85,
    calories: 220,
    like_count: 27,
    comment_count: 5,
    user_has_liked: true,
    owner: {
      id: "u2",
      username: "jane_smith",
      display_name: "Jane Smith",
      avatar_url: "https://i.pravatar.cc/150?img=5",
    },
  },
  {
    id: "r3",
    vehicle_id: "v3",
    vehicle_type: "mobil",
    vehicle_name: "Toyota Avanza",
    status: "completed",
    started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    distance_km: 150.3,
    duration_seconds: 7200,
    max_speed_kmh: 110,
    avg_speed_kmh: 75,
    elevation_m: 45,
    calories: 180,
    like_count: 8,
    comment_count: 1,
    user_has_liked: false,
    owner: {
      id: "u3",
      username: "budi_santoso",
      display_name: "Budi Santoso",
      avatar_url: "https://i.pravatar.cc/150?img=8",
    },
  },
];

export default function HomeScreen() {
  return (
    <ThemedView className="flex-1">
      <FlatList
        data={MOCK_FEED}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedPost post={item} />}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}
