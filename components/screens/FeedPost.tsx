import Ionicons from "@expo/vector-icons/Ionicons";
import { Avatar } from "heroui-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { VEHICLE_CONFIG } from "../../src/constants/vehicles";
import { FeedItem, VehicleType } from "../../src/types";
import { formatDistance, formatDuration } from "../../src/utils/metrics";
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
    <ThemedView className="">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => onUserPress?.(post.owner.id)}
          className="flex-row items-center gap-3 flex-1"
        >
          <Avatar size="md" alt={`${post.owner.display_name} avatar`}>
            {post.owner.avatar_url ? (
              <Avatar.Image source={{ uri: post.owner.avatar_url }} />
            ) : null}
            <Avatar.Fallback>
              <Text className="text-sm font-semibold">{initials}</Text>
            </Avatar.Fallback>
          </Avatar>
          <View className="flex-1">
            <Text className="font-semibold text-slate-900 dark:text-white text-sm">
              {post.owner.display_name}
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {timeAgo}
            </Text>
          </View>
        </Pressable>
        <Pressable
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="p-2"
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#64748b" />
        </Pressable>
      </View>

      {/* Ride Visual */}
      <View
        className="w-full aspect-square items-center justify-center"
        style={{ backgroundColor: vehicleConfig.bgColor }}
      >
        <View className="items-center gap-3">
          <Ionicons
            name={post.vehicle_type === "mobil" ? "car" : "bicycle-sharp"}
            size={56}
            color={vehicleConfig.color}
          />
          <Text className="text-white text-sm font-medium tracking-wide uppercase">
            {post.vehicle_name}
          </Text>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: vehicleConfig.color + "33" }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: vehicleConfig.color }}
            >
              {vehicleConfig.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions Bar */}
      <View className="flex-row justify-between items-center px-4 py-3">
        <View className="flex-row gap-5">
          <Pressable
            onPress={() => onLike?.(post.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="active:opacity-60"
          >
            <Ionicons
              name={post.user_has_liked ? "heart" : "heart-outline"}
              size={26}
              color={post.user_has_liked ? vehicleConfig.color : "#64748b"}
            />
          </Pressable>
          <Pressable
            onPress={() => onComment?.(post.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="active:opacity-60"
          >
            <Ionicons name="chatbubble-outline" size={26} color="#64748b" />
          </Pressable>
          <Pressable
            onPress={() => onShare?.(post.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="active:opacity-60"
          >
            <Ionicons name="share-social-outline" size={26} color="#64748b" />
          </Pressable>
        </View>
        <Pressable
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="active:opacity-60"
        >
          <Ionicons name="bookmark-outline" size={26} color="#64748b" />
        </Pressable>
      </View>

      {/* Likes & Comments count */}
      <View className="px-4 pb-2 gap-1">
        {post.like_count > 0 && (
          <Text className="text-sm font-semibold text-slate-900 dark:text-white">
            {post.like_count} {post.like_count === 1 ? "like" : "likes"}
          </Text>
        )}
        <Text className="text-sm text-slate-900 dark:text-white">
          <Text className="font-semibold">{post.owner.display_name}</Text>
          {post.title ? ` ${post.title}` : " completed a ride"}
        </Text>
        {post.comment_count > 0 && (
          <Pressable onPress={() => onComment?.(post.id)}>
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              View all {post.comment_count}{" "}
              {post.comment_count === 1 ? "comment" : "comments"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Metrics */}
      <View className="px-4 pb-4">
        <View className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 flex-row justify-between">
          <MetricItem
            label="Distance"
            value={formatDistance(post.distance_km)}
            color={vehicleConfig.color}
          />
          <View className="w-px bg-slate-200 dark:bg-slate-700" />
          <MetricItem
            label="Duration"
            value={formatDuration(post.duration_seconds)}
            color="#64748b"
          />
          <View className="w-px bg-slate-200 dark:bg-slate-700" />
          <MetricItem
            label="Max Speed"
            value={`${post.max_speed_kmh.toFixed(0)} km/h`}
            color="#64748b"
          />
        </View>
      </View>
    </ThemedView>
  );
}

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
