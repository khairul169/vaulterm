import { View, Text, Button, Card, XStack } from "tamagui";
import React from "react";
import { MultiTapPressable } from "@/components/ui/pressable";
import Icons from "@/components/ui/icons";
import OSIcons from "@/components/ui/os-icons";
import Badge from "@/components/ui/badge";

type HostItemProps = {
  host: any;
  selected?: boolean;
  onMultiTap: () => void;
  onTap?: () => void;
};

const HostItem = ({ host, selected, onMultiTap, onTap }: HostItemProps) => {
  return (
    <MultiTapPressable
      cursor="pointer"
      group
      numberOfTaps={2}
      onMultiTap={onMultiTap}
      onTap={onTap}
      h="100%"
    >
      <Card
        bordered
        p="$4"
        borderColor={selected ? "$blue8" : "$borderColor"}
        bg={selected ? "$blue3" : undefined}
        h="100%"
      >
        <XStack>
          {host.type === "group" ? (
            <Icons name="package-variant-closed" size={18} mr="$2" mt="$1" />
          ) : (
            <OSIcons
              name={host.os}
              size={18}
              mr="$2"
              mt="$1"
              fallback="desktop-classic"
            />
          )}

          <View flex={1}>
            <Text>{host.label}</Text>

            {host.tags?.length > 0 && (
              <XStack mt="$1" gap="$1" flexWrap="wrap">
                {host.tags.map((i: any) => (
                  <Badge key={i.name}>{i.name}</Badge>
                ))}
              </XStack>
            )}

            <Text fontSize="$3" mt="$2">
              {host.host}
            </Text>
          </View>
        </XStack>
      </Card>
    </MultiTapPressable>
  );
};

export default HostItem;
