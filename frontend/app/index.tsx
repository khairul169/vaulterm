import { View, Text, ScrollView, Button } from "react-native";
import React, { useState } from "react";
import { Stack } from "expo-router";
import InteractiveSession from "@/components/containers/interactive-session";
import PagerView from "@/components/ui/pager-view";

let nextSession = 1;

const HomePage = () => {
  const [sessions, setSessions] = useState<string[]>(["1"]);
  const [curSession, setSession] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: "Home" }} />

      <ScrollView
        horizontal
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ flexDirection: "row", gap: 8 }}
      >
        {sessions.map((session, idx) => (
          <View
            key={session}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Button
              title={"Session " + session}
              color="#222"
              onPress={() => setSession(idx)}
            />
            <Button
              title="X"
              onPress={() => {
                const newSessions = sessions.filter((s) => s !== session);
                setSessions(newSessions);
                setSession(
                  Math.min(Math.max(curSession, 0), newSessions.length - 1)
                );
              }}
            />
          </View>
        ))}

        <Button
          title="[ + ]"
          onPress={() => {
            nextSession += 1;
            setSessions([...sessions, nextSession.toString()]);
            setSession(sessions.length);
          }}
        />
      </ScrollView>

      <PagerView style={{ flex: 1 }} page={curSession}>
        {sessions.map((session) => (
          <InteractiveSession
            key={session}
            type="ssh"
            options={{ serverId: session }}
          />
        ))}
      </PagerView>
    </View>
  );
};

export default HomePage;
