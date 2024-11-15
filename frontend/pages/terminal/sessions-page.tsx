import React, { useMemo, useState } from "react";
import { router, Stack } from "expo-router";
import { Button, ScrollView, View } from "tamagui";
import { useTermSession } from "@/stores/terminal-sessions";
import SearchInput from "@/components/ui/search-input";
import Icons from "@/components/ui/icons";

const SessionsPage = () => {
  const { sessions, setSession, curSession, remove } = useTermSession();
  const [search, setSearch] = useState("");

  const sessionList = useMemo(() => {
    let items = sessions;

    if (search) {
      items = items.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      );
    }

    return items;
  }, [sessions, search]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Sessions",
          headerRight: () => (
            <Button
              bg="$colorTransparent"
              icon={<Icons name="plus" size={24} />}
              onPress={() => {
                router.back();
                router.push("/hosts");
              }}
            >
              New
            </Button>
          ),
        }}
      />

      <View p="$3">
        <SearchInput
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={{ px: "$3", pt: "$1" }}>
        {sessionList.map((session, idx) => (
          <View key={session.id} mb="$3" position="relative">
            <Button
              bg={idx !== curSession ? "$colorTransparent" : undefined}
              borderWidth={1}
              borderColor="$blue4"
              justifyContent="flex-start"
              textAlign="left"
              size="$5"
              pl="$4"
              icon={<Icons name="connection" size={16} />}
              onPress={() => {
                router.back();
                setSession(idx);
              }}
            >
              {session.label}
            </Button>

            <Button
              bg="$colorTransparent"
              circular
              size="$3"
              position="absolute"
              top="$2"
              right="$2"
              onPress={(e) => {
                e.stopPropagation();
                remove(idx);
              }}
            >
              <Icons name="close" size={16} />
            </Button>
          </View>
        ))}
      </ScrollView>
    </>
  );
};

export default SessionsPage;
