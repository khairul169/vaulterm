import React from "react";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { Button, View } from "tamagui";
import {
  CommonActions,
  DrawerActions,
  useLinkBuilder,
} from "@react-navigation/native";
import { Link } from "expo-router";
import Icons from "../ui/icons";
import { logout } from "@/stores/auth";

const Drawer = (props: DrawerContentComponentProps) => {
  return (
    <>
      <DrawerContentScrollView
        contentContainerStyle={{ padding: 18 }}
        {...props}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View p="$4">
        <Button
          justifyContent="flex-start"
          icon={<Icons name="logout" size={16} />}
          onPress={() => logout()}
        >
          Logout
        </Button>
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

    const { title, drawerLabel, drawerIcon } = descriptors[route.key].options;

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
