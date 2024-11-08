import { useRef } from "react";
import {
  TapGestureHandler,
  State as GestureState,
} from "react-native-gesture-handler";
import { Button, GetProps, styled, View, ViewStyle } from "tamagui";

const StyledPressable = styled(Button, {
  unstyled: true,
  backgroundColor: "$colorTransparent",
  borderWidth: 0,
  cursor: "pointer",
});

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
    <StyledPressable
      hoverStyle={$hover}
      pressStyle={$pressed}
      {...(props as any)}
    />
  );
};

type MultiTapPressableProps = GetProps<typeof View> & {
  numberOfTaps: number;
  onTap?: () => void;
  onMultiTap?: () => void;
};

export const MultiTapPressable = ({
  numberOfTaps,
  onTap,
  onMultiTap,
  ...props
}: MultiTapPressableProps) => {
  const tapRef = useRef<any>();

  return (
    <TapGestureHandler
      onHandlerStateChange={(e) => {
        if (e.nativeEvent.state === GestureState.ACTIVE) {
          onTap?.();
        }
      }}
      waitFor={tapRef}
    >
      <TapGestureHandler
        onHandlerStateChange={(e) => {
          if (e.nativeEvent.state === GestureState.ACTIVE) {
            onMultiTap?.();
          }
        }}
        numberOfTaps={numberOfTaps}
        ref={tapRef}
      >
        <View pressStyle={{ opacity: 0.5 }} {...props} />
      </TapGestureHandler>
    </TapGestureHandler>
  );
};

export default Pressable;
