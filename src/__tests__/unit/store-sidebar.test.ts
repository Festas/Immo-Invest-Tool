import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useImmoCalcStore } from "@/store";

describe("Store sidebar state", () => {
  beforeEach(async () => {
    localStorage.clear();
    useImmoCalcStore.setState({ sidebarCollapsed: false });
    await useImmoCalcStore.persist.rehydrate();
  });

  it("toggles sidebarCollapsed reliably", () => {
    expect(useImmoCalcStore.getState().sidebarCollapsed).toBe(false);

    act(() => {
      useImmoCalcStore.getState().toggleSidebar();
    });
    expect(useImmoCalcStore.getState().sidebarCollapsed).toBe(true);

    act(() => {
      useImmoCalcStore.getState().toggleSidebar();
    });
    expect(useImmoCalcStore.getState().sidebarCollapsed).toBe(false);
  });

  it("persists sidebarCollapsed to localStorage", async () => {
    act(() => {
      useImmoCalcStore.getState().setSidebarCollapsed(true);
    });

    await waitFor(() => {
      const raw = localStorage.getItem("immocalc-storage");
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed.state.sidebarCollapsed).toBe(true);
    });
  });

  it("rehydrates sidebarCollapsed from persisted state", async () => {
    act(() => {
      useImmoCalcStore.setState({ sidebarCollapsed: false });
    });

    localStorage.setItem(
      "immocalc-storage",
      JSON.stringify({
        state: { sidebarCollapsed: true },
        version: 0,
      })
    );

    await act(async () => {
      await useImmoCalcStore.persist.rehydrate();
    });

    expect(useImmoCalcStore.getState().sidebarCollapsed).toBe(true);
  });
});
