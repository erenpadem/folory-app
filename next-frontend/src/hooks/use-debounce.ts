import { useCallback, useEffect, useRef } from 'react';

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number,
  options?: { leading?: boolean }
) => {
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const leadingCallRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    if (options?.leading && leadingCallRef.current) {
      leadingCallRef.current = false;
      func(...args);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      leadingCallRef.current = true;
      func(...args);
    }, delay);
  }, [func, delay, options?.leading]);
};