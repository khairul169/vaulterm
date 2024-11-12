import React from "react";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerNavigationOptions as NavProps,
} from "@react-navigation/drawer";
import { Button, View } from "tamagui";
import {
  CommonActions,
  DrawerActions,
  useLinkBuilder,
} from "@react-navigation/native";
import { Link } from "expo-router";
import ThemeSwitcher from "./theme-switcher";
import UserMenuButton from "./user-menu-button";

export type DrawerNavigationOptions = NavProps & {
  hidden?: boolean | null;
};

const Drawer = (props: DrawerContentComponentProps) => {
  return (
    <>
      <View p="$4">
        <UserMenuButton />
      </View>

      <DrawerContentScrollView
        contentContainerStyle={{ padding: 18, paddingTop: 0 }}
        {...props}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View px="$4" py="$2">
        <ThemeSwitcher />
      </View>
    </>
  );
};

const DrawerItemList = ({
  state,
  navigation,
  descriptors,
}: DrawerContentComponentProps) => {
  const { buildHref } = useLinkBuilder();

  return state.routes.map((route, i) => {
    const focused = i === state.index;

    const onPress = () => {
      const event = navigation.emit({
        type: "drawerItemPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        navigation.dispatch({
          ...(focused
            ? DrawerActions.closeDrawer()
            : CommonActions.navigate(route)),
          target: state.key,
        });
      }
    };

    const { title, drawerLabel, drawerIcon, hidden } = descriptors[route.key]
      .options as DrawerNavigationOptions;

    if (hidden) {
      return null;
    }

    return (
      <Link key={route.key} href={buildHref(route.name, route.params) as never}>
        <Button
          w="100%"
          justifyContent="flex-start"
          bg={focused ? "$background" : "$colorTransparent"}
          onPress={onPress}
          icon={drawerIcon?.({ size: 16, color: "$color", focused }) as never}
        >
          {drawerLabel !== undefined
            ? drawerLabel
            : title !== undefined
            ? title
            : route.name}
        </Button>
      </Link>
    );
  }) as React.ReactNode as React.ReactElement;
};

export default Drawer;
