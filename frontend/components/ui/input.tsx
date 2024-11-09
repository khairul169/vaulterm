import { Controller, FieldValues } from "react-hook-form";
import { FormFieldBaseProps } from "./utility";
import { Input, View } from "tamagui";
import { ComponentPropsWithoutRef } from "react";
import { ErrorMessage } from "./form";

type InputFieldProps<T extends FieldValues> = FormFieldBaseProps<T> &
  ComponentPropsWithoutRef<typeof Input>;

export const InputField = <T extends FieldValues>({
  form,
  name,
  ...props
}: InputFieldProps<T>) => (
  <Controller
    control={form.control}
    name={name}
    render={({ field, fieldState }) => (
      <>
        <Input {...field} {...props} />
        <ErrorMessage error={fieldState.error} />
      </>
    )}
  />
);

export default Input;
