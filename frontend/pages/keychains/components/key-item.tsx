import { View, Text, Button, Card, XStack } from "tamagui";
import React from "react";
import Pressable from "@/components/ui/pressable";
import Icons from "@/components/ui/icons";

type KeyItemProps = {
  data: any;
  onPress?: () => void;
};

const icons: Record<string, string> = {
  user: "account",
  pve: "account-key",
  rsa: "key",
  cert: "certificate",
};

const KeyItem = ({ data, onPress }: KeyItemProps) => {
  return (
    <Pressable group onPress={onPress}>
      <Card bordered px="$4" py="$3">
        <XStack alignItems="center">
          <Icons
            name={(icons[data.type] || "key") as never}
            size={20}
            mr="$3"
          />

          <View flex={1}>
            <Text textAlign="left">{data.label}</Text>
            <Text textAlign="left" fontSize="$3" mt="$1">
              {data.type}
            </Text>
          </View>

          <Button
            circular
            opacity={0}
            $sm={{ opacity: 1 }}
            animation="quickest"
            animateOnly={["opacity"]}
            $group-hover={{ opacity: 1 }}
            onPress={(e) => {
              e.stopPropagation();
              onPress?.();
            }}
          >
            <Icons name="pencil" size={16} />
          </Button>
        </XStack>
      </Card>
    </Pressable>
  );
};

export default KeyItem;
