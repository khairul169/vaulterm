import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const HomePage = () => {
  return (
    <View>
      <Stack.Screen options={{ title: "Home" }} />
      <Text>HomePage</Text>
    </View>
  );
};

export default HomePage;
