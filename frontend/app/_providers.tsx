import React, { PropsWithChildren, useMemo, useState } from "react";
import tamaguiConfig from "@/tamagui.config";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { TamaguiProvider, Theme } from "@tamagui/core";
import useThemeStore from "@/stores/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type Props = PropsWithChildren;

const Providers = ({ children }: Props) => {
  const colorScheme = useThemeStore((i) => i.theme);
  const [queryClient] = useState(() => new QueryClient());

  const theme = useMemo(() => {
    return colorScheme === "dark"
      ? tamaguiConfig.themes.dark_blue
      : tamaguiConfig.themes.light_blue;
  }, [colorScheme]);

  const navTheme = useMemo(() => {
    const base = colorScheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.background.val,
      },
    };
  }, [theme, colorScheme]);

  return (
    <ThemeProvider value={navTheme}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme}>
        <Theme name="blue">
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </Theme>
      </TamaguiProvider>
    </ThemeProvider>
  );
};

export default Providers;
