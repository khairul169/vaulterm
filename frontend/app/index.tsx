import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import Terminal from "@/components/containers/terminal";

const HomePage = () => {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: "Home" }} />

      <Terminal wsUrl="ws://10.0.0.100:3000/ws" />
    </View>
  );
};

export default HomePage;
