import React, { forwardRef } from "react";
import { Select as BaseSelect } from "tamagui";

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
              >
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

export default Select;
