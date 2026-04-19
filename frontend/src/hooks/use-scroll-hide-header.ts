'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Hides the header while scrolling down, shows again on scroll up or near the top.
 */
export function useScrollHideHeader(enabled: boolean) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setHidden(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const threshold = 56;

    const onScroll = () => {
      const y = window.scrollY;
      if (y < threshold) {
        setHidden(false);
      } else if (y > lastY.current && y >= threshold) {
        setHidden(true);
      } else if (y < lastY.current) {
        setHidden(false);
      }
      lastY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    lastY.current = window.scrollY;
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled]);

  return hidden;
}
