import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { View } from "react-native";
import { PagerViewProps, PagerViewRef } from "./pager-view";

const PagerView = forwardRef<PagerViewRef, PagerViewProps>(
  ({ children, initialPage }, ref) => {
    const [curPage, setPage] = useState<number>(initialPage || 0);

    useImperativeHandle(ref, () => ({
      setPage,
      setPageWithoutAnimation: setPage,
    }));

    const content = useMemo(() => {
      if (!Array.isArray(children)) {
        return null;
      }

      return children.map((element, index) => {
        return (
          <View
            key={element.key || index}
            style={{ display: index === curPage ? "flex" : "none", flex: 1 }}
          >
            {element}
          </View>
        );
      });
    }, [curPage, children]);

    return content;
  }
);

export default PagerView;
