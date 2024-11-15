import React, { PropsWithChildren, useEffect, useMemo, useState } from "react";
import tamaguiConfig from "@/tamagui.config";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { TamaguiProvider, Theme } from "@tamagui/core";
import useThemeStore from "@/stores/theme";
import { QueryClientProvider } from "@tanstack/react-query";
import { router, usePathname, useRootNavigationState } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { PortalProvider } from "tamagui";
import { useServer } from "@/stores/app";
import queryClient from "@/lib/queryClient";
import DialogMessageProvider from "@/components/containers/dialog-message";

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider />
      <ThemeProvider>
        {children}
        <DialogMessageProvider />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const ThemeProvider = ({ children }: PropsWithChildren) => {
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
        card: theme.background.val,
        border: theme.borderColor.val,
      },
    };
  }, [theme, colorScheme]);

  return (
    <NavThemeProvider value={navTheme}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme}>
        <Theme name="blue">
          <PortalProvider shouldAddRootHost>{children}</PortalProvider>
        </Theme>
      </TamaguiProvider>
    </NavThemeProvider>
  );
};

const AuthProvider = () => {
  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();
  const { isLoggedIn } = useAuthStore();
  const curServer = useServer();

  useEffect(() => {
    if (!rootNavigationState?.key) {
      return;
    }

    if (!curServer && !pathname.startsWith("/server")) {
      router.replace("/server");
      return;
    }

    const isProtected = !["/auth", "/server"].find((path) =>
      pathname.startsWith(path)
    );

    if (isProtected && !isLoggedIn) {
      router.replace("/auth/login");
    }
  }, [pathname, rootNavigationState, isLoggedIn]);

  return null;
};

export default Providers;
