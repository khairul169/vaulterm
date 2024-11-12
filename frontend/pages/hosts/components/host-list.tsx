import { View, Text, Spinner } from "tamagui";
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useNavigation } from "expo-router";
import SearchInput from "@/components/ui/search-input";
import { useTermSession } from "@/stores/terminal-sessions";
import { hostFormModal } from "./form";
import GridView from "@/components/ui/grid-view";
import HostItem from "./host-item";

type HostsListProps = {
  allowEdit?: boolean;
};

const HostList = ({ allowEdit = true }: HostsListProps) => {
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

    return items.map((i: any) => ({ ...i, key: i.id }));
  }, [hosts.data, search]);

  const onEdit = (host: any) => {
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
        <GridView
          data={hostsList}
          columns={{ sm: 2, lg: 3, xl: 4 }}
          contentContainerStyle={{ p: "$2", pt: 0 }}
          gap="$2.5"
          renderItem={(host: any) => (
            <HostItem
              host={host}
              onTap={() => {}}
              onMultiTap={() => onOpenTerminal(host)}
              onEdit={allowEdit ? () => onEdit(host) : null}
            />
          )}
        />
      )}
    </>
  );
};

export default React.memo(HostList);
