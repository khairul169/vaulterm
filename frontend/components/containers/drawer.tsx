import React from "react";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerNavigationOptions as NavProps,
} from "@react-navigation/drawer";
import { Button, Text, View } from "tamagui";
import {
  CommonActions,
  DrawerActions,
  useLinkBuilder,
} from "@react-navigation/native";
import { Link } from "expo-router";
import ThemeSwitcher from "./theme-switcher";
import UserMenuButton from "./user-menu-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type DrawerNavigationOptions = NavProps & {
  hidden?: boolean | null;
};

const Drawer = (props: DrawerContentComponentProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View pt={insets.top} flex={1}>
      <View py="$4" px="$2">
        <UserMenuButton />
      </View>

      <DrawerContentScrollView
        contentContainerStyle={{
          paddingTop: 0,
          paddingLeft: 0,
          paddingStart: 0,
          paddingRight: 18,
          paddingBottom: 18,
        }}
        {...props}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View px="$4" py="$2">
        <ThemeSwitcher $xs={{ alignSelf: "flex-start" }} />
      </View>
    </View>
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
          size="$4"
          $xs={{ size: "$5" }}
          borderRadius={0}
          borderTopRightRadius="$10"
          borderBottomRightRadius="$10"
          borderWidth={0}
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
