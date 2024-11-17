import React, { forwardRef, useMemo, useState } from "react";
import { Controller, FieldValues } from "react-hook-form";
import {
  Adapt,
  Button,
  Dialog,
  Input,
  ListItem,
  ScrollView,
  Sheet,
  Text,
  View,
} from "tamagui";
import { FormFieldBaseProps } from "./utility";
import { ErrorMessage } from "./form";
import Icons from "./icons";

export type SelectItem = {
  label: string;
  value: string;
};

type SelectMultipleProps = React.ComponentPropsWithoutRef<typeof ListItem> & {
  items?: SelectItem[] | null;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  isCreatable?: boolean;
  onCreate?: (value: string) => void;
};

type SelectMultipleRef = React.ElementRef<typeof ListItem>;

const SelectMultiple = forwardRef<SelectMultipleRef, SelectMultipleProps>(
  (props, ref) => {
    const {
      items,
      value,
      defaultValue,
      onChange,
      placeholder = "Select...",
      isCreatable = false,
      onCreate,
      ...restProps
    } = props;

    const [search, setSearch] = useState("");

    const itemList = useMemo(() => {
      if (!items?.length) {
        return [];
      }

      let list = [...items];

      const searchText = search.toLowerCase().trim();
      if (searchText?.length > 0) {
        list = list.filter((i) => i.label.toLowerCase().includes(searchText));
      }

      return list.sort((a) => (value?.includes(a.value) ? -1 : 1));
    }, [items, search, value]);

    const onCreateNew = () => {
      const newItem = search.trim();
      onCreate?.(newItem);
      onItemPress(newItem);
      setSearch("");
    };

    const onItemPress = (key: string) => {
      const curValues = [...(value || [])];
      const idx = curValues.indexOf(key);
      if (idx >= 0) {
        curValues.splice(idx, 1);
        onChange?.(curValues);
      } else {
        curValues.push(key);
        onChange?.(curValues);
      }
    };

    const onEnter = () => {
      if (itemList.length > 0) {
        onItemPress(itemList[0].value);
        setSearch("");
        return;
      }

      const newItem = search.trim();
      if (isCreatable && newItem.length > 0) {
        return onCreateNew();
      }
    };

    return (
      <Dialog>
        <Dialog.Trigger asChild {...restProps}>
          <ListItem
            ref={ref}
            backgrounded
            hoverTheme
            pressTheme
            borderRadius="$4"
            tabIndex={0}
            focusVisibleStyle={{
              outlineStyle: "solid",
              outlineWidth: 2,
              outlineColor: "$outlineColor",
            }}
            borderWidth={1}
            title={value?.join(", ") || placeholder}
          />
        </Dialog.Trigger>

        <Adapt when="sm" platform="touch">
          <Sheet animation="quick" zIndex={999} modal dismissOnSnapToBottom>
            <Sheet.Overlay
              opacity={0.1}
              animation="quickest"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
              zIndex={0}
            />
            <Sheet.Frame>
              <Adapt.Contents />
            </Sheet.Frame>
          </Sheet>
        </Adapt>

        <Dialog.Portal zIndex={999}>
          <Dialog.Overlay
            key="overlay"
            animation="quickest"
            opacity={0.2}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />

          <Dialog.Content
            bordered
            key="content"
            elevate
            animateOnly={["transform", "opacity"]}
            animation={["quickest", { opacity: { overshootClamping: true } }]}
            enterStyle={{ x: 0, opacity: 0, scale: 0.95 }}
            exitStyle={{ x: 0, opacity: 0, scale: 0.98 }}
            p="$1"
            w="90%"
            maxWidth={400}
            height="80%"
            maxHeight={400}
          >
            <View p="$3">
              <Dialog.Title fontWeight="normal" fontSize="$7">
                {placeholder}
              </Dialog.Title>
              <Input
                mt="$1"
                placeholder="Search..."
                autoFocus
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={onEnter}
              />
            </View>

            <Dialog.Close asChild>
              <Button
                position="absolute"
                top="$2"
                right="$2"
                size="$3"
                bg="$colorTransparent"
                circular
                icon={<Icons name="close" size={16} />}
              />
            </Dialog.Close>

            <ScrollView>
              {!itemList?.length && !isCreatable ? (
                <Text textAlign="center" my="$2">
                  No results
                </Text>
              ) : null}

              {!itemList?.length && isCreatable && search.trim().length > 0 ? (
                <ListItem
                  hoverTheme
                  pressTheme
                  onPress={onCreateNew}
                  title={`Create "${search}"`}
                />
              ) : null}

              {itemList?.map((item) => (
                <ListItem
                  key={item.value}
                  bg="$colorTransparent"
                  hoverTheme
                  pressTheme
                  onPress={() => onItemPress(item.value)}
                  iconAfter={
                    value?.includes(item.value) ? (
                      <Icons name="check" size={16} />
                    ) : undefined
                  }
                  title={item.label}
                />
              ))}
            </ScrollView>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    );
  }
);

type SelectMultipleFieldProps<T extends FieldValues> = FormFieldBaseProps<T> &
  SelectMultipleProps;

export const SelectMultipleField = <T extends FieldValues>({
  form,
  name,
  ...props
}: SelectMultipleFieldProps<T>) => (
  <Controller
    control={form.control}
    name={name}
    render={({ field, fieldState }) => (
      <>
        <SelectMultiple w="auto" f={1} {...field} {...props} />
        <ErrorMessage error={fieldState.error} />
      </>
    )}
  />
);

export const useSelectCreatableItems = (initialItems?: SelectItem[] | null) => {
  const [items, setItems] = useState<SelectItem[]>([]);
  const itemsCombined = useMemo(() => {
    return [...items, ...(initialItems || [])];
  }, [items, initialItems]);

  const addItem = (value: string) => {
    const idx = itemsCombined.findIndex((i) => i.value === value);
    if (idx >= 0) {
      return;
    }
    setItems([...items, { label: value, value }]);
  };

  return [itemsCombined, addItem, setItems] as const;
};

export default SelectMultiple;
