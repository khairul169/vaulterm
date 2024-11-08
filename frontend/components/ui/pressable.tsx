import { Pressable as BasePressable } from "react-native";
import { GetProps, styled, ViewStyle } from "tamagui";

const StyledPressable = styled(BasePressable);
export type PressableProps = GetProps<typeof StyledPressable> & {
  $hover?: ViewStyle;
  $pressed?: ViewStyle;
};

const Pressable = ({
  $hover,
  $pressed = { opacity: 0.5 },
  ...props
}: PressableProps) => {
  return (
    <StyledPressable pressStyle={$pressed} hoverStyle={$hover} {...props} />
  );
};

export default Pressable;
