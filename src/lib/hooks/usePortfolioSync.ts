/**
 * Hook to sync portfolio with server when user is authenticated
 */

import { useEffect } from "react";
import { useImmoCalcStore } from "@/store";

/**
 * Hook to check authentication status and enable server sync
 */
export function usePortfolioSync() {
  const { isServerSyncEnabled, setServerSyncEnabled, syncWithServer } = useImmoCalcStore();

  useEffect(() => {
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
      }
    };

    checkAuth();
  }, [isServerSyncEnabled, setServerSyncEnabled, syncWithServer]);
}
