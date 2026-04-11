import { BottomSheet, Button } from "heroui-native";
import React from "react";
import AuthTemplate from "../template/AuthTemplate";
import { AuthScreenProps } from "./type";

export default function AuthScreen(props: AuthScreenProps) {
  return (
    <BottomSheet className="w-full">
      <BottomSheet.Trigger asChild>
        <Button className="w-full">Login</Button>
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          className="p-5"
          snapPoints={["50%"]}
          enablePanDownToClose
        >
          {AuthTemplate({ screen: props.screen as any })}
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
