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
    <XStack alignItems="center" gap="$2">
      <Ionicons
        name={theme === "light" ? "moon-outline" : "sunny-outline"}
        size={iconSize}
      />
      <Label htmlFor={id} flex={1} cursor="pointer">
        {`${theme === "light" ? "Dark" : "Light"} Mode`}
      </Label>
      <Switch
        id={id}
        onPress={toggle}
        checked={theme === "dark"}
        size="$2"
        cursor="pointer"
        {...props}
      >
        <Switch.Thumb animation="quicker" />
      </Switch>
    </XStack>
  );
};

export default ThemeSwitcher;
