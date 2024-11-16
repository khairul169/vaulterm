import { View, Text } from "react-native";
import React from "react";
import HostList from "../hosts/components/host-list";
import { useQueryParams } from "@/hooks/useQueryParams";
import { BackButton } from "@/components/ui/button";
import { XStack } from "tamagui";

type Params = {
  parentId?: string | null;
};

const NewSessionPage = () => {
  const queryParams = useQueryParams<Params>();
  const parentId = queryParams.params?.parentId;

  const setParentId = (id: string | null) => {
    queryParams.push({ parentId: id || "" });
  };

  const onGoBack = () => {
    if (!queryParams.goBack()) {
      queryParams.replace({ parentId: "" });
    }
  };

  return (
    <>
      <XStack alignItems="center" h="$6">
        {parentId ? <BackButton onPress={onGoBack} /> : null}
      </XStack>
      <HostList
        allowEdit={false}
        parentId={parentId}
        onParentIdChange={setParentId}
      />
    </>
  );
};

export default NewSessionPage;
