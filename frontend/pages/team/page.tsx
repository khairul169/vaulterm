import {
  View,
  Text,
  ScrollView,
  ListItem,
  YGroup,
  Button,
  Avatar,
  AvatarFallback,
  XStack,
} from "tamagui";
import React from "react";
import { useTeam } from "./hooks/query";
import Drawer from "expo-router/drawer";
import { useTeamId } from "@/stores/auth";
import { Redirect } from "expo-router";
import HeaderActions from "./components/header-actions";
import Icons from "@/components/ui/icons";
import tamaguiConfig from "@/tamagui.config";
import MemberList from "./components/member-list";
import { useUser } from "@/hooks/useUser";
import InviteForm, { inviteFormModal } from "./components/invite-form";
import ChangeRoleForm from "./components/change-role-form";

export default function TeamPage() {
  const teamId = useTeamId();
  const { isPending, data } = useTeam();
  const user = useUser();

  if (!teamId || (!isPending && !data)) {
    return <Redirect href="/" />;
  }

  const canWrite = user?.teamCanWrite(teamId);

  return (
    <>
      <Drawer.Screen
        options={{
          headerTitle: data ? `${data.icon} ${data.name}` : undefined,
          headerRight: () => <HeaderActions team={data} />,
        }}
      />

      <ScrollView
        contentContainerStyle={{
          padding: "$4",
          maxWidth: tamaguiConfig.media.xs.maxWidth,
        }}
      >
        <XStack alignItems="flex-end">
          <Text fontSize="$8" f={1} mb="$2">
            Team Members
          </Text>
          {canWrite && (
            <Button
              icon={<Icons name="account-plus" size={16} />}
              onPress={() =>
                inviteFormModal.onOpen({ teamId, username: "", role: "member" })
              }
            >
              Invite
            </Button>
          )}
        </XStack>
        <Text>
          {canWrite
            ? "Manage or view team members here"
            : "View your team members here"}
        </Text>

        <MemberList members={data?.members} allowWrite={canWrite} />

        <InviteForm />
        <ChangeRoleForm />
      </ScrollView>
    </>
  );
}
