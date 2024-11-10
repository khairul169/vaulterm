import React from "react";
import { Button, GetProps } from "tamagui";
import Icons from "../ui/icons";
import useThemeStore from "@/stores/theme";

type Props = GetProps<typeof Button> & {
  iconSize?: number;
};

const ThemeSwitcher = ({ iconSize = 24, ...props }: Props) => {
  const { theme, toggle } = useThemeStore();

  return (
    <Button
      icon={
        <Icons
          name={
            theme === "light" ? "white-balance-sunny" : "moon-waning-crescent"
          }
          size={iconSize}
        />
      }
      onPress={toggle}
      {...props}
    />
  );
};

export default ThemeSwitcher;
