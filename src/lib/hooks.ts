import { useEffect } from "react";

/**
 * Custom hook to lock body scroll when component is mounted
 * and restore it when unmounted. Useful for modals and overlays.
 *
 * @param enabled - Whether scroll lock should be active (default: true)
 */
export function useBodyScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [enabled]);
}
