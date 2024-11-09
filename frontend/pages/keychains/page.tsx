import React from "react";
import KeyList from "./components/key-list";
import KeyForm, { keyFormModal } from "./components/form";
import Drawer from "expo-router/drawer";
import { Button } from "tamagui";
import Icons from "@/components/ui/icons";
import { initialValues } from "./schema/form";

export default function KeychainsPage() {
  return (
    <>
      <Drawer.Screen
        options={{
          headerRight: () => (
            <Button
              bg="$colorTransparent"
              icon={<Icons name="plus" size={24} />}
              onPress={() => keyFormModal.onOpen(initialValues)}
              $gtSm={{ mr: "$3" }}
            >
              New
            </Button>
          ),
        }}
      />

      <KeyList />
      <KeyForm />
    </>
  );
}
