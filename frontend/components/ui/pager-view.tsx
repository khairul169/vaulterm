import React, { ComponentPropsWithoutRef, forwardRef } from "react";
import RNPagerView from "react-native-pager-view";

export type PagerViewProps = ComponentPropsWithoutRef<typeof RNPagerView> & {
  onChangePage?: (page: number) => void;
};

export type PagerViewRef = {
  setPage: (page: number) => void;
  setPageWithoutAnimation: (page: number) => void;
};

const PagerView = forwardRef<PagerViewRef, PagerViewProps>(
  ({ onChangePage, children, ...props }, ref) => {
    return (
      <RNPagerView
        ref={ref as never}
        {...props}
        onPageSelected={(e) => {
          const pos = e.nativeEvent.position;
          onChangePage?.(pos);
        }}
      >
        {children}
      </RNPagerView>
    );
  }
);

export default PagerView;
