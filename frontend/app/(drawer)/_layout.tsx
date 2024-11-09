import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { useMedia } from "tamagui";

export default function Layout() {
  const media = useMedia();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          drawerType: media.sm ? "front" : "permanent",
          drawerStyle: { width: 250 },
          headerLeft: media.sm ? undefined : () => null,
        }}
      >
        <Drawer.Screen name="hosts" options={{ title: "Hosts" }} />
        <Drawer.Screen name="keychains" options={{ title: "Keychains" }} />
        <Drawer.Screen
          name="terminal"
          options={{ title: "Terminal", headerShown: media.sm }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
