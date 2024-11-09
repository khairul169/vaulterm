import React, { PropsWithChildren, useEffect, useMemo, useState } from "react";
import tamaguiConfig from "@/tamagui.config";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { TamaguiProvider, Theme } from "@tamagui/core";
import useThemeStore from "@/stores/theme";
import { QueryClientProvider } from "@tanstack/react-query";
import { router, usePathname, useRootNavigationState } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { PortalProvider } from "tamagui";
import { queryClient } from "@/lib/api";

type Props = PropsWithChildren;

const Providers = ({ children }: Props) => {
  const colorScheme = useThemeStore((i) => i.theme);

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
    <>
      <AuthProvider />
      <ThemeProvider value={navTheme}>
        <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme}>
          <Theme name="blue">
            <PortalProvider shouldAddRootHost>
              <QueryClientProvider client={queryClient}>
                {children}
              </QueryClientProvider>
            </PortalProvider>
          </Theme>
        </TamaguiProvider>
      </ThemeProvider>
    </>
  );
};

const AuthProvider = () => {
  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!rootNavigationState?.key) {
      return;
    }

    if (!pathname.startsWith("/auth") && !isLoggedIn) {
      router.replace("/auth/login");
    } else if (pathname.startsWith("/auth") && isLoggedIn) {
      router.replace("/");
    }
  }, [pathname, rootNavigationState, isLoggedIn]);

  return null;
};

export default Providers;
