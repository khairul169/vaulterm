import React from "react";
import { GetProps, Text, View } from "tamagui";

type BadgeProps = GetProps<typeof View>;

const Badge = ({ children, ...props }: BadgeProps) => {
  return (
    <View px={5} py={1} flexShrink={0} bg="$blue6" borderRadius="$3" {...props}>
      {typeof children === "string" ? (
        <Text fontSize="$2">{children}</Text>
      ) : (
        children
      )}
    </View>
  );
};

export default Badge;
