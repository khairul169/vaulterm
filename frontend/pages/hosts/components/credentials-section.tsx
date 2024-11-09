import Icons from "@/components/ui/icons";
import { keyFormModal } from "@/pages/keychains/components/form";
import { initialValues as keychainInitialValues } from "@/pages/keychains/schema/form";
import React from "react";
import { Button, Label, XStack } from "tamagui";

type Props = {
  type?: "user" | "rsa" | "pve" | "cert";
};

export default function CredentialsSection({ type = "user" }: Props) {
  return (
    <XStack gap="$3">
      <Label flex={1} h="$3">
        Credentials
      </Label>
      <Button
        size="$3"
        icon={<Icons size={16} name="plus" />}
        onPress={() =>
          keyFormModal.onOpen({ ...keychainInitialValues, type } as never)
        }
      >
        Add
      </Button>
    </XStack>
  );
}
