import React, { forwardRef } from "react";
import { Controller, FieldValues } from "react-hook-form";
import { Adapt, Select as BaseSelect, Sheet, Text } from "tamagui";
import { FormFieldBaseProps } from "./utility";
import { ErrorMessage } from "./form";
import Icons from "./icons";

export type SelectItem = {
  label: string;
  value: string;
};

type SelectProps = React.ComponentPropsWithoutRef<typeof BaseSelect.Trigger> & {
  items?: SelectItem[] | null;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

type SelectRef = React.ElementRef<typeof BaseSelect.Trigger>;

const Select = forwardRef<SelectRef, SelectProps>(
  (
    {
      items,
      value,
      defaultValue,
      onChange,
      placeholder = "Select...",
      ...props
    },
    ref
  ) => {
    return (
      <BaseSelect
        defaultValue={defaultValue}
        value={value}
        onValueChange={onChange}
      >
        <BaseSelect.Trigger ref={ref} {...props}>
          <BaseSelect.Value placeholder={placeholder} />
        </BaseSelect.Trigger>

        <Adapt when="sm" platform="touch">
          <Sheet native modal dismissOnSnapToBottom snapPoints={[40, 60, 80]}>
            <Sheet.Overlay
              opacity={0.1}
              animation="quickest"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
              zIndex={0}
            />
            {/* <Sheet.Handle /> */}
            <Sheet.Frame>
              <Sheet.ScrollView contentContainerStyle={{ py: "$3" }}>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
          </Sheet>
        </Adapt>

        <BaseSelect.Content>
          <BaseSelect.ScrollUpButton />
          <BaseSelect.Viewport>
            <BaseSelect.Item value="" index={0}>
              <BaseSelect.ItemText>{placeholder}</BaseSelect.ItemText>
            </BaseSelect.Item>

            {items?.map((item, idx) => (
              <BaseSelect.Item
                key={item.value}
                value={item.value}
                index={idx + 1}
                justifyContent="flex-start"
                gap="$2"
              >
                {value === item.value && <Icons name="check" size={16} />}
                <BaseSelect.ItemText>{item.label}</BaseSelect.ItemText>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Viewport>
          <BaseSelect.ScrollDownButton />
        </BaseSelect.Content>
      </BaseSelect>
    );
  }
);

type SelectFieldProps<T extends FieldValues> = FormFieldBaseProps<T> &
  SelectProps;

export const SelectField = <T extends FieldValues>({
  form,
  name,
  ...props
}: SelectFieldProps<T>) => (
  <Controller
    control={form.control}
    name={name}
    render={({ field, fieldState }) => (
      <>
        <Select w="auto" f={1} {...field} {...props} />
        <ErrorMessage error={fieldState.error} />
      </>
    )}
  />
);

export default Select;
