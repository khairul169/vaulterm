import { View, Text, Spinner } from "tamagui";
import React, { useMemo, useState } from "react";
import SearchInput from "@/components/ui/search-input";
import GridView from "@/components/ui/grid-view";
import { useKeychains } from "../hooks/query";
import KeyItem from "./key-item";
import { keyFormModal } from "./form";

const KeyList = () => {
  const [search, setSearch] = useState("");
  const keys = useKeychains({ withData: true });

  const keyList = useMemo(() => {
    let items = keys.data || [];

    if (search) {
      items = items.filter((item: any) => {
        const q = search.toLowerCase();
        return item.label.toLowerCase().includes(q);
      });
    }

    return items.map((i: any) => ({ ...i, key: i.id }));
  }, [keys.data, search]);

  const onEdit = (item: any) => {
    keyFormModal.onOpen(item);
  };

  return (
    <>
      <View p="$4" pb="$3">
        <SearchInput
          placeholder="Search key..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {keys.isLoading ? (
        <View alignItems="center" justifyContent="center" flex={1}>
          <Spinner size="large" />
          <Text mt="$4">Loading...</Text>
        </View>
      ) : (
        <GridView
          data={keyList}
          columns={{ sm: 2, lg: 3, xl: 4 }}
          contentContainerStyle={{ p: "$2", pt: 0 }}
          gap="$2.5"
          renderItem={(item: any) => (
            <KeyItem data={item} onPress={() => onEdit(item)} />
          )}
        />
      )}
    </>
  );
};

export default React.memo(KeyList);
