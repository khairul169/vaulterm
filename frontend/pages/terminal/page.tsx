import React, { useEffect, useMemo, useRef } from "react";
import InteractiveSession from "@/components/containers/interactive-session";
import PagerView, { PagerViewRef } from "@/components/ui/pager-view";
import { useTermSession } from "@/stores/terminal-sessions";
import { Button, useMedia } from "tamagui";
import SessionTabs from "./components/session-tabs";
import Drawer from "expo-router/drawer";
import { router } from "expo-router";
import Icons from "@/components/ui/icons";
import { useDebounceCallback } from "@/hooks/useDebounce";
import NewSessionPage from "./new-session-page";

const TerminalPage = () => {
  const pagerViewRef = useRef<PagerViewRef>(null!);
  const { sessions, curSession, setSession } = useTermSession();
  const session = sessions[curSession];
  const media = useMedia();

  const setCurSession = useDebounceCallback((idx: number) => {
    pagerViewRef.current?.setPage(idx);
  }, 100);

  useEffect(() => {
    setCurSession(curSession);
  }, [curSession]);

  const pagerView = useMemo(() => {
    if (!sessions.length) {
      return null;
    }
    return (
      <PagerView
        ref={pagerViewRef}
        style={{ flex: 1 }}
        onChangePage={setSession}
        initialPage={0}
      >
        {sessions.map((session) => (
          <InteractiveSession key={session.id} {...session} />
        ))}
      </PagerView>
    );
  }, [sessions]);

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
      {!sessions.length ? <NewSessionPage /> : pagerView}
    </>
  );
};

export default TerminalPage;
