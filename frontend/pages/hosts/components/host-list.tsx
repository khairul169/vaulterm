import { View, Text, Spinner, ScrollView } from "tamagui";
import React, { useMemo, useState } from "react";
import { useNavigation } from "expo-router";
import SearchInput from "@/components/ui/search-input";
import { useTermSession } from "@/stores/terminal-sessions";
import { hostFormModal } from "./form";
import { GridLayout } from "@/components/ui/grid-view";
import HostItem from "./host-item";
import { useHosts } from "../hooks/query";
import HostActions from "./host-actions";

type HostsListProps = {
  allowEdit?: boolean;
  parentId?: string | null;
  onParentIdChange?: (id: string | null) => void;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  hideGroups?: boolean;
};

const HostList = ({
  allowEdit = true,
  parentId,
  onParentIdChange,
  selected = [],
  onSelectedChange,
  hideGroups = false,
}: HostsListProps) => {
  const openSession = useTermSession((i) => i.push);
  const navigation = useNavigation();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useHosts({
    parentId: !search.length ? parentId : "none",
  });

  const hostsList = useMemo(() => {
    let items = data || [];

    if (search) {
      items = items.filter((item: any) => {
        const q = search.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.host.toLowerCase().includes(q) ||
          item.tags.find((i: any) => i.name.toLowerCase().includes(q)) != null
        );
      });
    }

    return items.map((i: any) => ({ ...i, key: i.id }));
  }, [data, search]);

  const groups = useMemo(
    () => hostsList.filter((i: any) => i.type === "group"),
    [hostsList]
  );

  const hosts = useMemo(
    () => hostsList.filter((i: any) => i.type !== "group"),
    [hostsList]
  );

  const onSelect = (host: any) => {
    if (selected.includes(host.id)) {
      onSelectedChange?.(selected.filter((i) => i !== host.id));
    } else {
      onSelectedChange?.([...selected, host.id]);
    }
  };

  const onEdit = (host: any) => {
    if (!allowEdit) return;
    const data = { ...host, tags: host.tags?.map((i: any) => i.name) };
    hostFormModal.onOpen(data);
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

      {isLoading ? (
        <View alignItems="center" justifyContent="center" flex={1}>
          <Spinner size="large" />
          <Text mt="$4">Loading...</Text>
        </View>
      ) : (
        <ScrollView>
          {groups.length > 0 && !hideGroups && (
            <>
              <Text mx="$4">Groups</Text>
              <ItemList
                data={groups}
                selected={selected}
                onTap={selected.length > 0 ? onSelect : undefined}
                onMultiTap={(group) => onParentIdChange?.(group.id)}
                onEdit={allowEdit ? onEdit : undefined}
              />
            </>
          )}

          <Text mx="$4">Hosts</Text>
          {!hosts.length && (
            <Text mx="$4" fontSize="$3" mt="$2">
              No hosts found
            </Text>
          )}

          <ItemList
            data={hosts}
            selected={selected}
            onTap={selected.length > 0 ? onSelect : undefined}
            onMultiTap={onOpenTerminal}
            onEdit={allowEdit ? onEdit : undefined}
            onSelect={onSelectedChange ? onSelect : undefined}
          />
        </ScrollView>
      )}
    </>
  );
};

type ItemListProps = {
  data?: any[];
  selected?: string[];
  onTap?: (host: any) => void;
  onMultiTap?: (host: any) => void;
  onEdit?: (host: any) => void;
  onSelect?: (host: any) => void;
};

const ItemList = ({
  data,
  selected,
  onTap,
  onMultiTap,
  onEdit,
  onSelect,
}: ItemListProps) => (
  <GridLayout
    data={data}
    columns={{ sm: 2, lg: 3, xl: 4 }}
    padding="$2"
    gap="$2.5"
    renderItem={(host: any) => (
      <View position="relative" h="100%">
        <HostItem
          host={host}
          selected={selected?.includes(host.id)}
          onTap={() => onTap?.(host)}
          onMultiTap={() => onMultiTap?.(host)}
        />
        <HostActions
          position="absolute"
          top="$2"
          right="$2"
          onSelect={onSelect ? () => onSelect?.(host) : undefined}
          onEdit={onEdit ? () => onEdit?.(host) : undefined}
        />
      </View>
    )}
  />
);

export default React.memo(HostList);
