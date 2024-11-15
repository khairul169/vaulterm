import React from "react";
import { useTermSession } from "@/stores/terminal-sessions";
import { Button, ScrollView, View } from "tamagui";
import Icons from "@/components/ui/icons";
import { router } from "expo-router";

const SessionTabs = () => {
  const { sessions, curSession, setSession, remove } = useTermSession();

  return (
    <ScrollView
      horizontal
      flexGrow={0}
      bg="$background"
      contentContainerStyle={{
        flexDirection: "row",
        pt: "$2",
        px: "$2",
        gap: "$2",
      }}
    >
      {sessions.map((session, idx) => (
        <View key={session.id} position="relative">
          <Button
            size="$3"
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            onPress={() => setSession(idx)}
            pl="$4"
            pr="$6"
            bg={curSession === idx ? "$blue7" : "$blue3"}
          >
            {session.label}
          </Button>
          <Button
            circular
            bg="$colorTransparent"
            onPress={(e) => {
              e.stopPropagation();
              remove(idx);
            }}
            icon={<Icons name="close" size={16} />}
            size="$2"
            position="absolute"
            top="$1.5"
            right="$1"
            opacity={0.6}
            hoverStyle={{ opacity: 1 }}
          />
        </View>
      ))}

      <Button
        onPress={() => router.push("/hosts")}
        size="$2.5"
        bg="$colorTransparent"
        circular
        icon={<Icons name="plus" size={16} />}
      />
    </ScrollView>
  );
};

export default SessionTabs;
