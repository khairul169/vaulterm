import { Button, GetProps, useMedia } from "tamagui";
import React, { useMemo, useState } from "react";
import Drawer from "expo-router/drawer";
import HostList from "./components/host-list";
import HostForm, { hostFormModal } from "./components/form";
import Icons from "@/components/ui/icons";
import { initialValues } from "./schema/form";
import KeyForm from "../keychains/components/form";
import { useUser } from "@/hooks/useUser";
import { useTeamId } from "@/stores/auth";
import { useMoveHost } from "./hooks/query";
import { useQueryParams } from "@/hooks/useQueryParams";
import { BackButton } from "@/components/ui/button";

type Params = {
  parentId?: string | null;
};

export default function HostsPage() {
  const teamId = useTeamId();
  const user = useUser();
  const [selected, setSelected] = useState<string[]>([]);
  const queryParams = useQueryParams<Params>();
  const parentId = queryParams.params?.parentId;
  const media = useMedia();

  const setParentId = (id: string | null) => {
    queryParams.push({ parentId: id || "" });
  };

  const onGoBack = () => {
    if (!queryParams.goBack()) {
      queryParams.replace({ parentId: "" });
    }
  };

  const actions = useMemo(() => {
    if (selected?.length > 0) {
      return (
        <HostsActions
          selected={selected}
          parentId={parentId}
          onClear={() => setSelected([])}
        />
      );
    }

    if (!teamId || user?.teamCanWrite(teamId)) {
      return (
        <AddButton
          onPress={() => hostFormModal.onOpen({ ...initialValues, parentId })}
        />
      );
    }

    return null;
  }, [teamId, user, parentId]);

  return (
    <>
      <Drawer.Screen
        options={{
          headerLeft: parentId
            ? () => <BackButton onPress={onGoBack} />
            : media.gtXs
            ? () => null
            : undefined,
          headerTitle:
            selected.length > 0 ? `Selected ${selected.length} hosts` : "Hosts",
          headerRight: () => actions,
        }}
      />

      <HostList
        parentId={parentId}
        onParentIdChange={setParentId}
        selected={selected}
        onSelectedChange={setSelected}
      />

      <HostForm />
      <KeyForm />
    </>
  );
}

const AddButton = (props: GetProps<typeof Button>) => (
  <Button
    bg="$colorTransparent"
    icon={<Icons name="plus" size={24} />}
    $gtSm={{ mr: "$2" }}
    {...props}
  >
    New
  </Button>
);

type HostsActionsProps = {
  selected: string[];
  parentId?: string | null;
  onClear: () => void;
};

const actionMode = {
  CUT: 1,
};

const HostsActions = ({
  selected,
  parentId = null,
  onClear,
}: HostsActionsProps) => {
  const [curMode, setCurMode] = useState(0);
  const move = useMoveHost();

  const onReset = () => {
    setCurMode(0);
    onClear();
  };

  const onMoveAction = () => {
    move.mutate({ parentId, hostId: selected }, { onSuccess: onReset });
  };

  return (
    <>
      {curMode === actionMode.CUT ? (
        <Button
          key="paste"
          circular
          icon={<Icons name="content-paste" size={20} />}
          bg="$colorTransparent"
          onPress={onMoveAction}
        />
      ) : (
        <Button
          key="cut"
          circular
          icon={<Icons name="content-cut" size={20} />}
          bg="$colorTransparent"
          onPress={() => setCurMode(actionMode.CUT)}
        />
      )}
      {/* <Button
        circular
        icon={<Icons name="trash-can" size={24} />}
        bg="$colorTransparent"
      /> */}
      <Button
        key="close"
        circular
        icon={<Icons name="close" size={24} />}
        bg="$colorTransparent"
        onPress={onReset}
        mr="$2"
      />
    </>
  );
};
