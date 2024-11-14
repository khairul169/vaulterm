import React from "react";
import { Platform } from "react-native";
import {
  Adapt,
  GetProps,
  ListItem,
  Popover,
  withStaticProperties,
} from "tamagui";

type MenuButtonProps = GetProps<typeof Popover> & {
  asChild?: boolean;
  trigger?: React.ReactNode;
  width?: string | number | null;
};

const MenuButtonFrame = ({
  asChild = true,
  trigger,
  children,
  width,
  ...props
}: MenuButtonProps) => {
  return (
    <Popover size="$1" {...props}>
      <Popover.Trigger asChild={asChild}>{trigger}</Popover.Trigger>

      <Adapt when="sm" platform="touch">
        <Popover.Sheet modal dismissOnSnapToBottom snapPointsMode="fit">
          <Popover.Sheet.Overlay
            animation="quickest"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Popover.Sheet.Frame padding="$4">
            {/* <Adapt.Contents /> */}
            {children}
          </Popover.Sheet.Frame>
        </Popover.Sheet>
      </Adapt>

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

const MenuButtonItem = (props: GetProps<typeof ListItem>) => {
  if (Platform.OS === "android" || Platform.OS === "ios") {
    return <ListItem hoverTheme pressTheme {...props} />;
  }

  return (
    <Popover.Close asChild>
      <ListItem hoverTheme pressTheme {...props} />
    </Popover.Close>
  );
};

const MenuButton = withStaticProperties(MenuButtonFrame, {
  Item: MenuButtonItem,
});

export default MenuButton;
