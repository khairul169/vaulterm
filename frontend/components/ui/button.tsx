import React from "react";
import { GetProps, Button as BaseButton, Spinner } from "tamagui";
import Icons from "./icons";

type ButtonProps = GetProps<typeof BaseButton> & {
  isDisabled?: boolean;
  isLoading?: boolean;
};

const Button = ({ icon, isLoading, isDisabled, ...props }: ButtonProps) => {
  return (
    <BaseButton
      icon={isLoading ? <Spinner /> : icon}
      disabled={isLoading || isDisabled || props.disabled}
      {...props}
    />
  );
};

export const BackButton = (props: GetProps<typeof Button>) => (
  <Button
    circular
    bg="$colorTransparent"
    icon={<Icons name="arrow-left" size={24} />}
    mr={6}
    {...props}
  />
);

export default Button;
