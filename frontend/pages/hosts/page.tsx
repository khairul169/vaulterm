import { Button } from "tamagui";
import React from "react";
import Drawer from "expo-router/drawer";
import HostList from "./components/host-list";
import HostForm, { hostFormModal } from "./components/form";
import Icons from "@/components/ui/icons";
import { initialValues } from "./schema/form";
import KeyForm from "../keychains/components/form";
import { useUser } from "@/hooks/useUser";
import { useTeamId } from "@/stores/auth";

export default function HostsPage() {
  const teamId = useTeamId();
  const user = useUser();

  return (
    <>
      <Drawer.Screen
        options={{
          headerRight:
            !teamId || user?.teamCanWrite(teamId)
              ? () => <AddButton />
              : undefined,
        }}
      />

      <HostList />
      <HostForm />
      <KeyForm />
    </>
  );
}

const AddButton = () => (
  <Button
    bg="$colorTransparent"
    icon={<Icons name="plus" size={24} />}
    onPress={() => hostFormModal.onOpen(initialValues)}
    $gtSm={{ mr: "$3" }}
  >
    New
  </Button>
);
