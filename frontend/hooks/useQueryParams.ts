import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";

export const useQueryParams = <T extends object>() => {
  const params = useLocalSearchParams() as T;
  const [history, setHistory] = useState<T[]>([params]);

  const push = useCallback((params: T) => {
    setHistory((prev) => [...prev, params]);
    router.setParams(params);
  }, []);

  const replace = useCallback((params: T) => {
    setHistory([params]);
    router.setParams(params);
  }, []);

  const canGoBack = useMemo(() => history.length > 1, [history]);

  const goBack = useCallback(() => {
    if (!canGoBack) {
      return false;
    }

    const historyList = [...history];
    historyList.pop();
    const prev = historyList[historyList.length - 1];
    if (!prev) {
      return false;
    }

    setHistory(historyList);
    router.setParams(prev);
    return true;
  }, [history, canGoBack]);

  return { params, replace, push, goBack, canGoBack };
};
