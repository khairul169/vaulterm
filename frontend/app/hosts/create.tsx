import React from "react";
import { Stack } from "expo-router";
import HostForm from "./_comp/host-form";

export default function CreateHostPage() {
  return (
    <>
      <Stack.Screen options={{ title: "Add Host" }} />
      <HostForm />
    </>
  );
}
