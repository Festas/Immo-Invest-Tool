import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Onboarding, useOnboarding } from "@/components/ui/onboarding";
import React from "react";

// Mock the useBodyScrollLock hook
vi.mock("@/lib/hooks", () => ({
  useBodyScrollLock: vi.fn(),
}));

// Mock PresetSelector component
vi.mock("@/components/ui/preset-selector", () => ({
  PresetSelector: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="preset-selector">
        <button onClick={onClose}>Close Presets</button>
      </div>
    );
  },
}));

describe("Onboarding Component", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();

    // Mock console methods to reduce test noise
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Scroll Lock Restoration", () => {
    it("should restore body scroll on component unmount", async () => {
      const { unmount } = render(<Onboarding />);

      // Wait for welcome modal to appear
      await waitFor(() => {
        expect(screen.queryByText(/Willkommen/)).toBeInTheDocument();
      });

      // Simulate some body scroll lock being applied
      document.body.style.overflow = "hidden";

      // Unmount the component
      unmount();

      // Check that scroll is restored
      expect(document.body.style.overflow).toBe("");
    });

    it("should restore scroll when skipping the tour", async () => {
      render(<Onboarding />);

      await waitFor(() => {
        expect(screen.queryByText(/Willkommen/)).toBeInTheDocument();
      });

      // Simulate scroll lock
      document.body.style.overflow = "hidden";

      // Click skip button
      const skipButton = screen.getByText("Tour überspringen");
      act(() => {
        skipButton.click();
      });

      // Wait for cleanup
      await waitFor(() => {
        expect(document.body.style.overflow).toBe("");
      });
    });
  });

  describe("useOnboarding Hook", () => {
    function TestComponent() {
      const { hasSeenOnboarding, markAsCompleted, resetOnboarding } = useOnboarding();

      return (
        <div>
          <div data-testid="has-seen">{hasSeenOnboarding.toString()}</div>
          <button onClick={markAsCompleted}>Mark Completed</button>
          <button onClick={resetOnboarding}>Reset</button>
        </div>
      );
    }

    it("should start with hasSeenOnboarding as false", () => {
      render(<TestComponent />);
      expect(screen.getByTestId("has-seen")).toHaveTextContent("false");
    });

    it("should mark as completed when markAsCompleted is called", async () => {
      render(<TestComponent />);

      const markButton = screen.getByText("Mark Completed");
      act(() => {
        markButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("has-seen")).toHaveTextContent("true");
      });
    });

    it("should persist state in localStorage", async () => {
      render(<TestComponent />);

      const markButton = screen.getByText("Mark Completed");
      act(() => {
        markButton.click();
      });

      await waitFor(() => {
        const stored = localStorage.getItem("immocalc-onboarding");
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.hasSeenOnboarding).toBe(true);
      });
    });

    it("should reset onboarding state", async () => {
      render(<TestComponent />);

      const markButton = screen.getByText("Mark Completed");
      act(() => {
        markButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("has-seen")).toHaveTextContent("true");
      });

      const resetButton = screen.getByText("Reset");
      act(() => {
        resetButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("has-seen")).toHaveTextContent("false");
      });
    });
  });

  describe("Step Transitions", () => {
    it("should not render overlapping modals during transitions", async () => {
      render(<Onboarding />);

      // Wait for welcome modal
      await waitFor(() => {
        expect(screen.queryByText(/Willkommen/)).toBeInTheDocument();
      });

      // Click continue button
      const continueButton = screen.getByText(/Los geht/);
      act(() => {
        continueButton.click();
      });

      // During transition, component should handle state properly
      // and not show multiple overlays simultaneously
      await waitFor(() => {
        const overlays = document.querySelectorAll('[data-coachmark-overlay="true"]');
        // Should have at most 1 overlay at any time
        expect(overlays.length).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle localStorage errors gracefully", () => {
      // Mock localStorage to throw error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error("Storage error");
      });

      function TestComponent() {
        const { markAsCompleted } = useOnboarding();
        return <button onClick={markAsCompleted}>Complete</button>;
      }

      render(<TestComponent />);

      const button = screen.getByText("Complete");

      // Should not throw error even if localStorage fails
      expect(() => {
        act(() => {
          button.click();
        });
      }).not.toThrow();

      // Restore original setItem
      Storage.prototype.setItem = originalSetItem;
    });
  });
});
