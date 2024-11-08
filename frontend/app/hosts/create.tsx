import React from "react";
import { Stack } from "expo-router";
import HostForm from "@/pages/hosts/components/form";

export default function CreateHostPage() {
  return (
    <>
      <Stack.Screen options={{ title: "Add Host" }} />
      <HostForm />
    </>
  );
}
