import React from "react";
import { Stack } from "expo-router";
import HostForm from "./_comp/host-form";

export default function EditHostPage() {
  return (
    <>
      <Stack.Screen options={{ title: "Edit Host" }} />
      <HostForm />
    </>
  );
}
