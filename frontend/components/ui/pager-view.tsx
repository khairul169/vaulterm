import React, { ComponentPropsWithoutRef, useEffect, useRef } from "react";
import RNPagerView from "react-native-pager-view";

export type PagerViewProps = ComponentPropsWithoutRef<typeof RNPagerView> & {
  page?: number;
  onChangePage?: (page: number) => void;
};

const PagerView = ({ page, onChangePage, ...props }: PagerViewProps) => {
  const ref = useRef<RNPagerView>(null);

  useEffect(() => {
    if (page != null) {
      ref.current?.setPage(page);
    }
  }, [page]);

  return (
    <RNPagerView
      ref={ref}
      {...props}
      onPageSelected={(e) => onChangePage?.(e.nativeEvent.position)}
    />
  );
};

export default PagerView;
