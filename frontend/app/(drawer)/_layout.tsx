import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { useMedia } from "tamagui";
import DrawerContent from "@/components/containers/drawer";
import Icons from "@/components/ui/icons";

export default function Layout() {
  const media = useMedia();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={DrawerContent}
        screenOptions={{
          drawerType: media.sm ? "front" : "permanent",
          drawerStyle: { width: 250 },
          headerLeft: media.sm ? undefined : () => null,
        }}
      >
        <Drawer.Screen
          name="hosts"
          options={{
            title: "Hosts",
            drawerIcon: ({ size, color }) => (
              <Icons name="server" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="keychains"
          options={{
            title: "Keychains",
            drawerIcon: ({ size, color }) => (
              <Icons name="key" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="terminal"
          options={{
            title: "Terminal",
            headerShown: media.sm,
            drawerIcon: ({ size, color }) => (
              <Icons name="console-line" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
