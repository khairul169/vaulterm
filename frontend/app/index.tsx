import { View, ScrollView, Button } from "react-native";
import React, { useState } from "react";
import { Stack } from "expo-router";
import InteractiveSession, {
  InteractiveSessionProps,
} from "@/components/containers/interactive-session";
import PagerView from "@/components/ui/pager-view";

type Session = InteractiveSessionProps & { id: string };

const HomePage = () => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      type: "ssh",
      params: { hostId: "01jc3v9w609f8e2wzw60amv195" },
    },
    {
      id: "2",
      type: "pve",
      params: { client: "vnc", hostId: "01jc3wp2b3zvgr777f4e3caw4w" },
    },
    {
      id: "3",
      type: "pve",
      params: { client: "xtermjs", hostId: "01jc3z3yyn2fgb77tyfxc1tkfy" },
    },
    {
      id: "4",
      type: "incus",
      params: {
        client: "xtermjs",
        hostId: "01jc3xz9db0v54dg10hk70a13b",
        shell: "fish",
      },
    },
  ]);
  const [curSession, setSession] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: "Home", headerShown: false }} />

      <ScrollView
        horizontal
        style={{ flexGrow: 0, backgroundColor: "#111" }}
        contentContainerStyle={{ flexDirection: "row", gap: 8 }}
      >
        {sessions.map((session, idx) => (
          <View
            key={session.id}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Button
              title={"Session " + session.id}
              color="#333"
              onPress={() => setSession(idx)}
            />
            <Button
              title="X"
              onPress={() => {
                const newSessions = sessions.filter((s) => s.id !== session.id);
                setSessions(newSessions);
                setSession(
                  Math.min(Math.max(curSession, 0), newSessions.length - 1)
                );
              }}
            />
          </View>
        ))}

        {/* <Button
          title="[ + ]"
          onPress={() => {
            nextSession += 1;
            setSessions([...sessions, nextSession.toString()]);
            setSession(sessions.length);
          }}
        /> */}
      </ScrollView>

      <PagerView style={{ flex: 1 }} page={curSession}>
        {sessions.map((session) => (
          <InteractiveSession key={session.id} {...session} />
        ))}
      </PagerView>
    </View>
  );
};

export default HomePage;
