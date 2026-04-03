import { Avatar, BottomSheet, ListGroup, useThemeColor } from "heroui-native";
import React from "react";
import { Text, View } from "react-native";

export default function Profile() {
  const [defaultColor] = useThemeColor(["default"]);
  return (
    <BottomSheet>
      <BottomSheet.Trigger>
        <Avatar alt="user profile" size="sm">
          <Avatar.Image source={{ uri: "https://placekitten.com/200/200" }} />
          <Avatar.Fallback>
            <Text>JD</Text>
          </Avatar.Fallback>
        </Avatar>
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content snapPoints={["80%"]}>
          <View className="flex-row items-center justify-end">
            <View className="flex-row items-center justify-center w-full absolute">
              <BottomSheet.Title>Account</BottomSheet.Title>
            </View>
            <BottomSheet.Close />
          </View>
          <View className="mt-4 flex-col items-center justify-center gap-4 flex">
            <ListGroup
              className="w-full"
              style={{ backgroundColor: defaultColor }}
            >
              <ListGroup.Item>
                <ListGroup.ItemContent>
                  <ListGroup.ItemTitle>John Doe</ListGroup.ItemTitle>
                </ListGroup.ItemContent>
                <ListGroup.ItemSuffix />
              </ListGroup.Item>
            </ListGroup>
            <ListGroup
              className="w-full"
              style={{ backgroundColor: defaultColor }}
            >
              <ListGroup.Item>
                <ListGroup.ItemContent>
                  <ListGroup.ItemTitle>John Doe</ListGroup.ItemTitle>
                </ListGroup.ItemContent>
                <ListGroup.ItemSuffix />
              </ListGroup.Item>
            </ListGroup>
            <ListGroup
              className="w-full"
              style={{ backgroundColor: defaultColor }}
            >
              <ListGroup.Item>
                <ListGroup.ItemContent>
                  <ListGroup.ItemTitle>John Doe</ListGroup.ItemTitle>
                </ListGroup.ItemContent>
                <ListGroup.ItemSuffix />
              </ListGroup.Item>
            </ListGroup>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
