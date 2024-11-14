import { Adapt, Button, Dialog, Sheet, Text, View } from "tamagui";
import React from "react";
import { createDisclosure } from "@/lib/utils";
import Icons from "./icons";

type ModalProps = {
  disclosure: ReturnType<typeof createDisclosure<any>>;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  maxHeight?: number | string;
};

const Modal = ({
  disclosure,
  children,
  title,
  description,
  width = 512,
  height = "90%",
  maxHeight = 600,
}: ModalProps) => {
  const { open, onOpenChange } = disclosure.use();

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <Adapt when="sm" platform="touch">
        <Sheet
          animation="quick"
          zIndex={999}
          modal
          dismissOnSnapToBottom
          // disableDrag
        >
          <Sheet.Overlay
            opacity={0.1}
            animation="quick"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
            zIndex={0}
          />
          <Sheet.Frame>
            <Adapt.Contents />
          </Sheet.Frame>
        </Sheet>
      </Adapt>

      <Dialog.Portal zIndex={999}>
        <Dialog.Overlay
          key="overlay"
          animation="quickest"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          key="content"
          elevate
          animateOnly={["transform", "opacity"]}
          animation={["quickest", { opacity: { overshootClamping: true } }]}
          enterStyle={{ x: 0, opacity: 0, scale: 0.95 }}
          exitStyle={{ x: 0, opacity: 0, scale: 0.98 }}
          p="$1"
          width="90%"
          maxWidth={width}
          height={height}
          maxHeight={maxHeight}
        >
          <View p="$4">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>{description}</Dialog.Description>
            <Dialog.Close asChild>
              <Button
                position="absolute"
                top="$2"
                right="$2"
                size="$3"
                bg="$colorTransparent"
                circular
                icon={<Icons name="close" size={16} />}
              />
            </Dialog.Close>
          </View>

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

export default Modal;
