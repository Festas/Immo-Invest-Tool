import { useEffect } from "react";

/**
 * Custom hook to lock body scroll when component is mounted
 * and restore it when unmounted. Useful for modals and overlays.
 */
export function useBodyScrollLock() {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);
}
