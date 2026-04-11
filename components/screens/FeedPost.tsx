import Ionicons from "@expo/vector-icons/Ionicons";
import { Avatar } from "heroui-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { VEHICLE_CONFIG } from "../../src/constants/vehicles";
import { FeedItem, VehicleType } from "../../src/types";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

interface FeedPostProps {
  post: FeedItem;
  onLike?: (rideId: string) => void;
  onComment?: (rideId: string) => void;
  onShare?: (rideId: string) => void;
  onUserPress?: (userId: string) => void;
}

export default function FeedPost({
  post,
  onLike,
  onComment,
  onShare,
  onUserPress,
}: FeedPostProps) {
  const vehicleConfig = VEHICLE_CONFIG[post.vehicle_type as VehicleType];
  const timeAgo = getTimeAgo(new Date(post.started_at));
  const initials = post.owner.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ThemedView className="flex flex-col items-center gap-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => onUserPress?.(post.owner.id)}
          className="flex-row items-center gap-3 flex-1"
        >
          <Avatar size="sm" alt={`${post.owner.display_name} avatar`}>
            {post.owner.avatar_url ? (
              <Avatar.Image source={{ uri: post.owner.avatar_url }} />
            ) : null}
            <Avatar.Fallback>
              <Text className="text-sm font-semibold">{initials}</Text>
            </Avatar.Fallback>
          </Avatar>
          <View className="flex-1">
            <ThemedText type="smallBold">{post.owner.display_name}</ThemedText>
            <ThemedText type="footnote">{timeAgo}</ThemedText>
          </View>
        </Pressable>
        <Pressable
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="p-2"
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#64748b" />
        </Pressable>
      </View>

      {/* post caption */}
      <ThemedText className="px-5" type="caption1">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Autem
        doloribus, voluptate omnis ab eius tempora dolores, corrupti cumque
        inventore quasi officia mollitia. Totam ullam molestias soluta veritatis
        reiciendis nisi magni.
      </ThemedText>

      {/* ride details */}
      <View className="flex flex-row w-full items-center px-5 py-1">
        <View className="flex-col items-center gap-1">
          <ThemedText type="small">Distance</ThemedText>
          <ThemedText type="defaultSemiBold">
            {post.distance_km.toFixed(1)} km
          </ThemedText>
        </View>
      </View>

      {/* post photo */}
      <View style={styles.postPhoto} />

      {/* post actions */}
      <View style={styles.actionsContainer}>
        <Pressable
          onPress={() => onLike?.(post.id)}
          style={styles.actionButton}
        >
          <Ionicons
            name={post.liked ? "heart" : "heart-outline"}
            size={20}
            color={post.liked ? "#ef4444" : "#64748b"}
          />
          <ThemedText type="small">{post.likes_count}</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => onComment?.(post.id)}
          style={styles.actionButton}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#64748b" />
          <ThemedText type="small">{post.comments_count}</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => onShare?.(post.id)}
          style={styles.actionButton}
        >
          <Ionicons name="share-social-outline" size={20} color="#64748b" />
          <ThemedText type="small">{post.shares_count}</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  postPhoto: {
    width: "100%",
    height: 256, // h-64 = 16rem = 256px
    backgroundColor: "#ffffff",
    borderRadius: 8, // rounded-lg
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20, // px-5
    paddingVertical: 12, // py-3
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // gap-2
  },
});

function MetricItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View className="items-center gap-1 flex-1">
      <Text className="text-xs text-slate-500 dark:text-slate-400">
        {label}
      </Text>
      <Text className="text-sm font-bold" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
