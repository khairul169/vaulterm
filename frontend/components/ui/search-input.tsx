import React from "react";
import { GetProps, Input, View, ViewStyle } from "tamagui";
import Icons from "./icons";

type SearchInputProps = GetProps<typeof Input> & {
  _container?: ViewStyle;
};

const SearchInput = ({ _container, ...props }: SearchInputProps) => {
  return (
    <View position="relative" {..._container}>
      <Icons
        name="magnify"
        size={20}
        position="absolute"
        top={11}
        left="$3"
        zIndex={1}
      />
      <Input pl="$7" placeholder="Search..." {...props} />
    </View>
  );
};

export default SearchInput;
