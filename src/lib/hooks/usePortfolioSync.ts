/**
 * Hook to sync portfolio with server when user is authenticated
 */

import { useEffect, useRef } from "react";
import { useImmoCalcStore } from "@/store";

/**
 * Hook to check authentication status and enable server sync
 */
export function usePortfolioSync() {
  const { isServerSyncEnabled, setServerSyncEnabled } = useImmoCalcStore();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only check once on mount
    if (hasCheckedRef.current) {
      return;
    }

    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          if (data.user && !isServerSyncEnabled) {
            // User is authenticated, enable server sync
            setServerSyncEnabled(true);
          }
        } else {
          // Not authenticated, ensure server sync is disabled
          if (isServerSyncEnabled) {
            setServerSyncEnabled(false);
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        hasCheckedRef.current = true;
      }
    };

    checkAuth();
  }, []); // Run only once on mount
}
