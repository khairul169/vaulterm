import { useCallback, useMemo, useRef } from "react";

export const useDebounceCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const fn = useCallback(
    (...args: Parameters<T>) => {
      clear();

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        callback(...args);
      }, delay);
    },
    [delay, clear]
  );

  return [fn, clear] as const;
};
