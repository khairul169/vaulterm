import { useDebounceCallback } from "@/hooks/useDebounce";
import React, { ComponentPropsWithoutRef, useEffect, useRef } from "react";
import RNPagerView from "react-native-pager-view";

export type PagerViewProps = ComponentPropsWithoutRef<typeof RNPagerView> & {
  page?: number;
  onChangePage?: (page: number) => void;
  EmptyComponent?: () => JSX.Element;
};

const PagerView = ({
  page,
  onChangePage,
  EmptyComponent,
  children,
  ...props
}: PagerViewProps) => {
  const ref = useRef<RNPagerView>(null);

  const [onPageSelect, clearPageSelectDebounce] = useDebounceCallback(
    (page) => onChangePage?.(page),
    100
  );

  const [setPage] = useDebounceCallback((page) => {
    ref.current?.setPage(page);
    clearPageSelectDebounce();
  }, 300);

  useEffect(() => {
    if (page != null) {
      const npage = EmptyComponent != null ? page + 1 : page;
      setPage(npage);
    }
  }, [page, EmptyComponent]);

  return (
    <RNPagerView
      ref={ref}
      {...props}
      onPageSelected={(e) => {
        const pos = e.nativeEvent.position;
        onPageSelect(EmptyComponent ? pos - 1 : pos);
      }}
    >
      {EmptyComponent ? <EmptyComponent key="-1" /> : null}
      {children}
    </RNPagerView>
  );
};

export default PagerView;
