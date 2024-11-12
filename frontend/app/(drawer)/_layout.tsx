import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { useMedia } from "tamagui";
import DrawerContent, {
  DrawerNavigationOptions,
} from "@/components/containers/drawer";
import Icons from "@/components/ui/icons";
import { useUser } from "@/hooks/useUser";
import { useTeamId } from "@/stores/auth";

export default function Layout() {
  const media = useMedia();
  const teamId = useTeamId();
  const user = useUser();

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
          options={
            {
              title: "Keychains",
              hidden: teamId && !user?.teamCanWrite(teamId),
              drawerIcon: ({ size, color }) => (
                <Icons name="key" size={size} color={color} />
              ),
            } as DrawerNavigationOptions
          }
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
