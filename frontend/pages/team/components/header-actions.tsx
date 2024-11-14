import React from "react";
import MenuButton from "@/components/ui/menu-button";
import { Button } from "tamagui";
import Icons from "@/components/ui/icons";
import { teamFormModal } from "./team-form";

type Props = {
  team: any;
};

export default function HeaderActions({ team }: Props) {
  return (
    <MenuButton
      placement="bottom-end"
      width={200}
      trigger={
        <Button
          circular
          bg="$colorTransparent"
          mr="$2"
          icon={<Icons name="dots-vertical" size={20} />}
        />
      }
    >
      <MenuButton.Item
        icon={<Icons name="pencil" size={16} />}
        onPress={() => teamFormModal.onOpen(team)}
      >
        Update Team
      </MenuButton.Item>
    </MenuButton>
  );
}
