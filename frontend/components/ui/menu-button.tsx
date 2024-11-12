import React from "react";
import {
  GetProps,
  ListItem,
  Popover,
  styled,
  withStaticProperties,
} from "tamagui";

type MenuButtonProps = GetProps<typeof Popover> & {
  asChild?: boolean;
  trigger?: React.ReactNode;
  width?: string | number | null;
};

const MenuButtonFrame = ({
  asChild,
  trigger,
  children,
  width,
  ...props
}: MenuButtonProps) => {
  return (
    <Popover {...props}>
      <Popover.Trigger asChild={asChild}>{trigger}</Popover.Trigger>

      <Popover.Content
        bordered
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        animation={["quick", { opacity: { overshootClamping: true } }]}
        width={width}
      >
        {children}
      </Popover.Content>
    </Popover>
  );
};

const MenuButtonItem = (props: GetProps<typeof ListItem>) => (
  <Popover.Close asChild>
    <ListItem hoverTheme pressTheme {...props} />
  </Popover.Close>
);

const MenuButton = withStaticProperties(MenuButtonFrame, {
  Item: MenuButtonItem,
});

export default MenuButton;
