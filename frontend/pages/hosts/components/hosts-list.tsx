import { View, Text, Button, ScrollView, Spinner, Card, XStack } from "tamagui";
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useNavigation } from "expo-router";
import { MultiTapPressable } from "@/components/ui/pressable";
import Icons from "@/components/ui/icons";
import SearchInput from "@/components/ui/search-input";
import { useTermSession } from "@/stores/terminal-sessions";
import { hostFormModal } from "./form";

const HostsList = () => {
  const openSession = useTermSession((i) => i.push);
  const navigation = useNavigation();
  const [search, setSearch] = useState("");

  const hosts = useQuery({
    queryKey: ["hosts"],
    queryFn: () => api("/hosts"),
    select: (i) => i.rows,
  });

  const hostsList = useMemo(() => {
    let items = hosts.data || [];

    if (search) {
      items = items.filter((item: any) => {
        const q = search.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.host.toLowerCase().includes(q)
        );
      });
    }

    return items;
  }, [hosts.data, search]);

  const onOpen = (host: any) => {
    hostFormModal.onOpen(host);
  };

  const onOpenTerminal = (host: any) => {
    const session: any = {
      id: host.id,
      label: host.label,
      type: host.type,
      params: {
        hostId: host.id,
      },
    };

    if (host.type === "pve") {
      session.params.client = host.metadata?.type === "lxc" ? "xtermjs" : "vnc";
    }

    openSession(session);
    navigation.navigate("terminal" as never);
  };

  return (
    <>
      <View p="$4" pb="$3">
        <SearchInput
          placeholder="Search label, host, or IP..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {hosts.isLoading ? (
        <View alignItems="center" justifyContent="center" flex={1}>
          <Spinner size="large" />
          <Text mt="$4">Loading...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: "$3",
            paddingTop: 0,
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {hostsList?.map((host: any) => (
            <MultiTapPressable
              key={host.id}
              flexBasis="100%"
              cursor="pointer"
              $gtXs={{ flexBasis: "50%" }}
              $gtSm={{ flexBasis: "33.3%" }}
              $gtMd={{ flexBasis: "25%" }}
              $gtLg={{ flexBasis: "20%" }}
              p="$2"
              group
              numberOfTaps={2}
              onMultiTap={() => onOpenTerminal(host)}
              onTap={() => onOpen(host)}
            >
              <Card bordered p="$4">
                <XStack>
                  <View flex={1}>
                    <Text>{host.label}</Text>
                    <Text fontSize="$3" mt="$2">
                      {host.host}
                    </Text>
                  </View>

                  <Button
                    circular
                    display="none"
                    $sm={{ display: "block" }}
                    $group-hover={{ display: "block" }}
                    onPress={(e) => {
                      e.stopPropagation();
                      onOpen(host);
                    }}
                  >
                    <Icons name="pencil" size={16} />
                  </Button>
                </XStack>
              </Card>
            </MultiTapPressable>
          ))}
        </ScrollView>
      )}
    </>
  );
};

export default HostsList;
