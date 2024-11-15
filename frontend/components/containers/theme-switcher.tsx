import React, { useId } from "react";
import { Switch, GetProps, XStack, Label } from "tamagui";
import useThemeStore from "@/stores/theme";
import { Ionicons } from "../ui/icons";

type Props = GetProps<typeof XStack> & {
  iconSize?: number;
};

const ThemeSwitcher = ({ iconSize = 18, ...props }: Props) => {
  const { theme, toggle } = useThemeStore();
  const id = useId();

  return (
    <XStack
      alignItems="center"
      gap="$4"
      w="auto"
      justifyContent="space-between"
      {...props}
    >
      <XStack alignItems="center" gap="$2">
        <Ionicons
          name={theme === "light" ? "moon-outline" : "sunny-outline"}
          size={iconSize}
        />
        <Label htmlFor={id} cursor="pointer">
          Dark Mode
        </Label>
      </XStack>
      <Switch
        id={id}
        onPress={toggle}
        checked={theme === "dark"}
        size="$2"
        cursor="pointer"
      >
        <Switch.Thumb animation="quicker" />
      </Switch>
    </XStack>
  );
};

export default ThemeSwitcher;
