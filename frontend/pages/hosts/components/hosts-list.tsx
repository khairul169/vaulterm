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
import OSIcons from "@/components/ui/os-icons";

type HostsListProps = {
  allowEdit?: boolean;
};

const HostsList = ({ allowEdit = true }: HostsListProps) => {
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
    if (!allowEdit) return;
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
              $gtMd={{ flexBasis: "33.3%" }}
              $gtLg={{ flexBasis: "25%" }}
              $gtXl={{ flexBasis: "20%" }}
              p="$2"
              group
              numberOfTaps={2}
              onMultiTap={() => onOpenTerminal(host)}
              onTap={() => onOpen(host)}
            >
              <Card bordered p="$4">
                <XStack>
                  <OSIcons
                    name={host.os}
                    size={18}
                    mr="$2"
                    fallback="desktop-classic"
                  />

                  <View flex={1}>
                    <Text>{host.label}</Text>
                    <Text fontSize="$3" mt="$2">
                      {host.host}
                    </Text>
                  </View>

                  {allowEdit && (
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
                  )}
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
