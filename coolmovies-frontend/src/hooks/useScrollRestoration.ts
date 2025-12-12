import { useEffect, useRef } from 'react';

export const useScrollRestoration = (key: string) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const storageKey = `scroll-position-${key}`;
    const savedScroll = sessionStorage.getItem(storageKey);

    if (savedScroll) {
      // Use requestAnimationFrame to ensure DOM is painted
      requestAnimationFrame(() => {
        container.scrollTop = parseInt(savedScroll, 10);
      });
    }

    const handleScroll = () => {
        if (container) {
            sessionStorage.setItem(storageKey, container.scrollTop.toString());
        }
    };

    // Use passive listener for better scrolling performance
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [key]);

  return ref;
};
