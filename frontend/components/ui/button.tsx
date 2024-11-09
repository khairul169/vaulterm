import React from "react";
import { GetProps, Button as BaseButton, Spinner } from "tamagui";

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

export default Button;
