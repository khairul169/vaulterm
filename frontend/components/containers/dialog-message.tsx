import { View, Text } from "react-native";
import React from "react";
import Modal from "../ui/modal";
import { dialogStore } from "@/hooks/useDialog";
import { Button, XStack } from "tamagui";

const DialogMessageProvider = () => {
  const { data, onClose } = dialogStore.use();

  return (
    <Modal
      disclosure={dialogStore}
      title={data?.title}
      description={data?.description}
      height="auto"
    >
      <XStack p="$4" gap="$4">
        <Button flex={1} onPress={data?.onCancel} bg="$colorTransparent">
          Cancel
        </Button>

        <Button
          flex={1}
          onPress={() => {
            data?.onConfirm?.();
            onClose();
          }}
        >
          Confirm
        </Button>
      </XStack>
    </Modal>
  );
};

export default DialogMessageProvider;
