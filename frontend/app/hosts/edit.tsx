import React from "react";
import { Stack } from "expo-router";
import HostForm from "@/pages/hosts/components/form";

export default function EditHostPage() {
  return (
    <>
      <Stack.Screen options={{ title: "Edit Host" }} />
      <HostForm />
    </>
  );
}
