import React, { ComponentPropsWithoutRef } from "react";
import { Label, Text, View, XStack } from "tamagui";

type FormFieldProps = ComponentPropsWithoutRef<typeof XStack> & {
  label?: string;
  htmlFor?: string;
};

const FormField = ({ label, htmlFor, ...props }: FormFieldProps) => {
  return (
    <XStack alignItems="flex-start" {...props}>
      <Label htmlFor={htmlFor} w={120} $xs={{ w: 100 }}>
        {label}
      </Label>
      <View w="auto" flex={1}>
        {props.children}
      </View>
    </XStack>
  );
};

type ErrorMessageProps = ComponentPropsWithoutRef<typeof Text> & {
  error?: unknown | null;
};

export const ErrorMessage = ({ error, ...props }: ErrorMessageProps) => {
  if (!error) {
    return null;
  }

  const message = (error as any)?.message || "Something went wrong";

  return (
    <Text color="red" fontSize="$3" mt="$1" {...props}>
      {message}
    </Text>
  );
};

export default FormField;
