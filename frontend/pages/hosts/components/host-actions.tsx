import React from "react";
import MenuButton from "@/components/ui/menu-button";
import { Button, GetProps } from "tamagui";
import Icons from "@/components/ui/icons";

type Props = GetProps<typeof Button> & {
  onSelect?: (() => void) | null;
  onEdit?: (() => void) | null;
};

const HostActions = ({ onSelect, onEdit, ...props }: Props) => {
  if (!onSelect && !onEdit) {
    return null;
  }

  return (
    <MenuButton
      placement="bottom-end"
      trigger={
        <Button
          circular
          bg="$colorTransparent"
          icon={<Icons name="dots-vertical" size={20} />}
          {...props}
        />
      }
    >
      {onSelect != null && (
        <MenuButton.Item
          onPress={onSelect}
          icon={<Icons name="cursor-pointer" size={16} />}
        >
          Select
        </MenuButton.Item>
      )}

      {onEdit != null && (
        <MenuButton.Item
          onPress={onEdit}
          icon={<Icons name="pencil" size={16} />}
        >
          Edit
        </MenuButton.Item>
      )}
    </MenuButton>
  );
};

export default HostActions;
