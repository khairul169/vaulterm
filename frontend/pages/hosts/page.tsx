import { Button } from "tamagui";
import React from "react";
import Drawer from "expo-router/drawer";
import HostList from "./components/host-list";
import HostForm, { hostFormModal } from "./components/form";
import Icons from "@/components/ui/icons";
import { initialValues } from "./schema/form";
import KeyForm from "../keychains/components/form";

export default function HostsPage() {
  return (
    <>
      <Drawer.Screen
        options={{
          headerRight: () => (
            <Button
              bg="$colorTransparent"
              icon={<Icons name="plus" size={24} />}
              onPress={() => hostFormModal.onOpen(initialValues)}
              $gtSm={{ mr: "$3" }}
            >
              New
            </Button>
          ),
        }}
      />

      <HostList />
      <HostForm />
      <KeyForm />
    </>
  );
}
