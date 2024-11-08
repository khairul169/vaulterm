import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { PagerViewProps } from "./pager-view";

const PagerView = ({
  EmptyComponent,
  children,
  page,
  initialPage,
}: PagerViewProps) => {
  const [curPage, setPage] = useState<number>(page || initialPage || 0);

  useEffect(() => {
    if (page != null) {
      setPage(page);
    }
  }, [page]);

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

  const pageElement = useMemo(() => {
    return Array.isArray(children) ? children[curPage] : null;
  }, [curPage, children]);

  return (
    <>
      {!pageElement && EmptyComponent ? <EmptyComponent key="-1" /> : null}
      {content}
    </>
  );
};

export default PagerView;
