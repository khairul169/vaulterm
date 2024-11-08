import React from "react";
import InteractiveSession from "@/components/containers/interactive-session";
import PagerView from "@/components/ui/pager-view";
import { useTermSession } from "@/stores/terminal-sessions";
import { Button, useMedia } from "tamagui";
import SessionTabs from "./components/session-tabs";
import HostsList from "../hosts/components/hosts-list";
import Drawer from "expo-router/drawer";
import { router } from "expo-router";
import Icons from "@/components/ui/icons";

const TerminalPage = () => {
  const { sessions, curSession, setSession } = useTermSession();
  const session = sessions[curSession];
  const media = useMedia();

  return (
    <>
      <Drawer.Screen
        options={{
          headerTitle: session?.label || "Terminal",
          headerRight: () => (
            <Button
              bg="$colorTransparent"
              icon={<Icons name="view-list" size={24} />}
              onPress={() => router.push("/terminal/sessions")}
            />
          ),
        }}
      />

      {sessions.length > 0 && media.gtSm ? <SessionTabs /> : null}

      <PagerView
        style={{ flex: 1 }}
        page={curSession}
        onChangePage={setSession}
        EmptyComponent={HostsList}
      >
        {sessions.map((session) => (
          <InteractiveSession key={session.id} {...session} />
        ))}
      </PagerView>
    </>
  );
};

export default TerminalPage;
