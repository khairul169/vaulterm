import Icons from "@/components/ui/icons";
import React from "react";
import { Button, Label, XStack } from "tamagui";

export default function CredentialsSection() {
  return (
    <XStack gap="$3">
      <Label flex={1} h="$3">
        Credentials
      </Label>
      <Button size="$3" icon={<Icons size={16} name="plus" />}>
        Add
      </Button>
    </XStack>
  );
}
