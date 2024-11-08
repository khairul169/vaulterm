import { Button } from "tamagui";
import React from "react";
import useThemeStore from "@/stores/theme";
import Drawer from "expo-router/drawer";
import HostsList from "./components/hosts-list";

export default function HostsPage() {
  const { toggle } = useThemeStore();

  return (
    <>
      <Drawer.Screen
        options={{
          headerRight: () => (
            <Button onPress={() => toggle()} mr="$2">
              Toggle Theme
            </Button>
          ),
        }}
      />

      <HostsList />
    </>
  );
}
