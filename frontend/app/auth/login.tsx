import { View, Text, Button } from "tamagui";
import React from "react";
import authStore from "@/stores/auth";

export default function LoginPage() {
  return (
    <View>
      <Text>LoginPage</Text>
      <Button onPress={() => authStore.setState({ token: "123" })}>
        Login
      </Button>
    </View>
  );
}
