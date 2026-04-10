/**
 * Hook to sync portfolio with server when user is authenticated
 */

import { useEffect, useRef, useCallback } from "react";
import { useImmoCalcStore } from "@/store";

/**
 * Hook to check authentication status and enable server sync
 */
export function usePortfolioSync() {
  const isServerSyncEnabled = useImmoCalcStore((state) => state.isServerSyncEnabled);
  const setServerSyncEnabled = useImmoCalcStore((state) => state.setServerSyncEnabled);
  const hasCheckedRef = useRef(false);

  const checkAuth = useCallback(async () => {
    if (hasCheckedRef.current) return;

    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        if (data.user && !isServerSyncEnabled) {
          setServerSyncEnabled(true);
        }
      } else {
        if (isServerSyncEnabled) {
          setServerSyncEnabled(false);
        }
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
    } finally {
      hasCheckedRef.current = true;
    }
  }, [isServerSyncEnabled, setServerSyncEnabled]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
}
