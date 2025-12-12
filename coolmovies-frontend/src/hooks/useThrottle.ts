import { useRef, useCallback } from 'react';

export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const lastRun = useRef(0);
  
  // Use a ref for the callback too, to prevent the throttle wrapper from
  // becoming stale or re-initializing unnecessarily if callback changes identity
  // but we want to keep the same timer. However, standard implementation usually
  // just depends on dependency array.
  // The user provided implementation:
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, delay]);
};
