import React, { useMemo } from "react";
import { GetProps, ScrollView, View, ViewStyle } from "tamagui";

type GridItem = { key: string };

type GridViewProps<T extends GridItem> = GetProps<typeof ScrollView> &
  GridLayoutProps<T>;

const GridView = <T extends GridItem>({
  data,
  renderItem,
  columns,
  gap,
  ...props
}: GridViewProps<T>) => {
  return (
    <ScrollView {...props}>
      <GridLayout
        data={data}
        renderItem={renderItem}
        gap={gap}
        columns={columns}
      />
    </ScrollView>
  );
};

type GridLayoutProps<T extends GridItem> = GetProps<typeof View> & {
  data?: T[] | null;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: string | number;
  columns: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
};

export const GridLayout = <T extends GridItem>({
  columns,
  data,
  renderItem,
  gap,
  ...props
}: GridViewProps<T>) => {
  const basisProps = useMemo(() => {
    const basis: ViewStyle = { flexBasis: "100%" };
    if (columns.xs) basis.flexBasis = `${100 / columns.xs}%`;
    if (columns.sm) basis.$gtXs = { flexBasis: `${100 / columns.sm}%` };
    if (columns.md) basis.$gtSm = { flexBasis: `${100 / columns.md}%` };
    if (columns.lg) basis.$gtMd = { flexBasis: `${100 / columns.lg}%` };
    if (columns.xl) basis.$gtLg = { flexBasis: `${100 / columns.xl}%` };
    return basis;
  }, [columns]);

  return (
    <View flexDirection="row" flexWrap="wrap" {...props}>
      {data?.map((item, idx) => (
        <View key={item.key} p={gap} flexShrink={0} {...basisProps}>
          {renderItem(item, idx)}
        </View>
      ))}
    </View>
  );
};

export default GridView;
