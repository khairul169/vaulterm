import { View, Text, Button, Card, XStack } from "tamagui";
import React from "react";
import { MultiTapPressable } from "@/components/ui/pressable";
import Icons from "@/components/ui/icons";
import OSIcons from "@/components/ui/os-icons";

type HostItemProps = {
  host: any;
  onMultiTap: () => void;
  onTap: () => void;
  onEdit?: (() => void) | null;
};

const HostItem = ({ host, onMultiTap, onTap, onEdit }: HostItemProps) => {
  return (
    <MultiTapPressable
      cursor="pointer"
      group
      numberOfTaps={2}
      onMultiTap={onMultiTap}
      onTap={onTap}
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

          {onEdit != null && (
            <Button
              circular
              display="none"
              $sm={{ display: "block" }}
              $group-hover={{ display: "block" }}
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Icons name="pencil" size={16} />
            </Button>
          )}
        </XStack>
      </Card>
    </MultiTapPressable>
  );
};

export default HostItem;
