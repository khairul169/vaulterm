import React from "react";
import {
  Avatar,
  Button,
  ListItem,
  Separator,
  Text,
  useMedia,
  View,
} from "tamagui";
import MenuButton from "../ui/menu-button";
import Icons from "../ui/icons";
import { logout, setTeam, useTeamId } from "@/stores/auth";
import { useUser } from "@/hooks/useUser";
import TeamForm, { teamFormModal } from "@/pages/team/components/team-form";

const UserMenuButton = () => {
  const user = useUser();
  const teamId = useTeamId();
  const team = user?.teams?.find((t: any) => t.id === teamId);

  return (
    <>
      <MenuButton
        size="$1"
        placement="bottom-end"
        width={213}
        trigger={
          <Button
            bg="$colorTransparent"
            borderWidth={0}
            justifyContent="flex-start"
            borderRadius="$10"
            py={0}
            px="$2"
            gap="$1"
          >
            <Avatar circular size="$3">
              <Avatar.Fallback bg="$blue4" />
            </Avatar>
            <View flex={1}>
              <Text textAlign='left' numberOfLines={1}>{user?.name}</Text>
              <Text textAlign='left' numberOfLines={1} fontWeight="600" mt="$1.5">
                {team ? `${team.icon} ${team.name}` : "Personal"}
              </Text>
            </View>
            <Icons name="chevron-down" size={16} mr="$2" />
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

      <TeamForm />
    </>
  );
};

const TeamsMenu = () => {
  const media = useMedia();
  const user = useUser();
  const teamId = useTeamId();
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
          icon={<Icons name="account-group" size={16} />}
          title="Teams"
          iconAfter={<Icons name="chevron-right" size={16} />}
        />
      }
    >
      {teamId != null && (
        <MenuButton.Item
          icon={<Icons name="account" size={16} />}
          title="Personal"
          onPress={() => setTeam(null)}
        />
      )}

      {teams.map((team: any) => (
        <MenuButton.Item
          key={team.id}
          icon={<Text>{team.icon}</Text>}
          iconAfter={
            teamId === team.id ? <Icons name="check" size={16} /> : undefined
          }
          title={team.name}
          onPress={() => setTeam(team.id)}
        />
      ))}

      {teams.length > 0 && <Separator width="100%" />}

      <MenuButton.Item
        icon={<Icons name="plus" size={16} />}
        title="Create Team"
        onPress={() => teamFormModal.onOpen({ icon: "🍃", name: "" })}
      />
    </MenuButton>
  );
};

export default UserMenuButton;
