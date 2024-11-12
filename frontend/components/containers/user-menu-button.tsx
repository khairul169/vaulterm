import React from "react";
import {
  Avatar,
  Button,
  ListItem,
  Separator,
  Text,
  useMedia,
  View,
  YGroup,
} from "tamagui";
import MenuButton from "../ui/menu-button";
import Icons from "../ui/icons";
import { logout } from "@/stores/auth";
import { useUser } from "@/hooks/useUser";

const UserMenuButton = () => {
  const user = useUser();

  return (
    <MenuButton
      size="$1"
      placement="bottom-end"
      width={213}
      trigger={
        <Button
          bg="$colorTransparent"
          justifyContent="flex-start"
          p={0}
          gap="$1"
        >
          <Avatar circular size="$3">
            <Avatar.Fallback bg="$blue4" />
          </Avatar>
          <View flex={1} style={{ textAlign: "left" }}>
            <Text numberOfLines={1}>{user?.name}</Text>
            <Text numberOfLines={1} fontWeight="600" mt="$1.5">
              Personal
            </Text>
          </View>
          <Icons name="chevron-down" size={16} />
        </Button>
      }
    >
      <TeamsMenu />
      <MenuButton.Item
        onPress={() => console.log("logout")}
        icon={<Icons name="account" size={16} />}
        title="Account"
      />
      <Separator w="100%" />
      <MenuButton.Item
        onPress={() => logout()}
        icon={<Icons name="logout" size={16} />}
        title="Logout"
      />
    </MenuButton>
  );
};

const TeamsMenu = () => {
  const media = useMedia();
  const user = useUser();
  const teams = user?.teams || [];

  return (
    <MenuButton
      size="$1"
      placement={media.xs ? "bottom" : "right-start"}
      asChild
      width={213}
      trigger={
        <ListItem
          hoverTheme
          pressTheme
          onPress={() => console.log("logout")}
          icon={<Icons name="account-group" size={16} />}
          title="Teams"
          iconAfter={<Icons name="chevron-right" size={16} />}
        />
      }
    >
      <MenuButton.Item
        icon={<Icons name="account" size={16} />}
        title="Personal"
      />

      {teams.map((team: any) => (
        <MenuButton.Item icon={<Text>{team.icon}</Text>} title={team.name} />
      ))}

      {teams.length > 0 && <Separator width="100%" />}

      <MenuButton.Item
        icon={<Icons name="plus" size={16} />}
        title="Create Team"
      />
    </MenuButton>
  );
};

export default UserMenuButton;
