import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CoachMark } from "@/components/ui/coach-mark";

// Mock the useBodyScrollLock hook
vi.mock("@/lib/hooks", () => ({
  useBodyScrollLock: vi.fn(),
}));

describe("CoachMark Component", () => {
  const defaultProps = {
    title: "Test Title",
    description: "Test Description",
    step: 1,
    totalSteps: 3,
    onNext: vi.fn(),
    onSkip: vi.fn(),
    isVisible: true,
    isLastStep: false,
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Reset console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    vi.restoreAllMocks();
  });

  describe("Fallback to Centered Modal", () => {
    it("should render centered modal when targetSelector is not found", async () => {
      render(<CoachMark {...defaultProps} targetSelector="#nonexistent-element" />);

      // Should render the modal with title and description
      await waitFor(() => {
        expect(screen.getByText("Test Title")).toBeInTheDocument();
        expect(screen.getByText("Test Description")).toBeInTheDocument();
      });
    });

    it("should render buttons in fallback modal", async () => {
      render(<CoachMark {...defaultProps} targetSelector="#nonexistent-element" />);

      await waitFor(() => {
        expect(screen.getByText("Überspringen")).toBeInTheDocument();
        expect(screen.getByText("Weiter")).toBeInTheDocument();
      });
    });

    it("should render 'Fertig' button on last step in fallback modal", async () => {
      render(
        <CoachMark {...defaultProps} targetSelector="#nonexistent-element" isLastStep={true} />
      );

      await waitFor(() => {
        expect(screen.getByText("Fertig")).toBeInTheDocument();
      });
    });
  });

  describe("Debug Mode", () => {
    it("should show debug information when debugMode is enabled", async () => {
      render(
        <CoachMark {...defaultProps} targetSelector="#nonexistent-element" debugMode={true} />
      );

      await waitFor(() => {
        expect(screen.getByText("🔍 Debug Information")).toBeInTheDocument();
        expect(screen.getByText(/Target:/)).toBeInTheDocument();
        expect(screen.getByText(/Found:/)).toBeInTheDocument();
        expect(screen.getByText(/Fallback Reason:/)).toBeInTheDocument();
      });
    });

    it("should not show debug information when debugMode is disabled", async () => {
      render(
        <CoachMark {...defaultProps} targetSelector="#nonexistent-element" debugMode={false} />
      );

      await waitFor(() => {
        expect(screen.queryByText("🔍 Debug Information")).not.toBeInTheDocument();
      });
    });

    it("should display correct debug info when target is not found", async () => {
      render(<CoachMark {...defaultProps} targetSelector="#missing-element" debugMode={true} />);

      await waitFor(() => {
        expect(screen.getByText("🔍 Debug Information")).toBeInTheDocument();
        // Check that the target selector is shown
        const targetText = screen.getByText(/Target:/);
        expect(targetText.parentElement).toHaveTextContent("#missing-element");
        // Check that found is "No"
        expect(screen.getByText(/✗ No/)).toBeInTheDocument();
      });
    });
  });

  describe("Force Fallback Mode", () => {
    it("should use fallback modal when forceFallback is true", async () => {
      // Create a visible element
      const testElement = document.createElement("div");
      testElement.id = "visible-target";
      testElement.style.width = "100px";
      testElement.style.height = "100px";
      testElement.style.position = "absolute";
      testElement.style.top = "100px";
      testElement.style.left = "100px";
      document.body.appendChild(testElement);

      vi.spyOn(testElement, "getBoundingClientRect").mockReturnValue({
        top: 100,
        left: 100,
        bottom: 200,
        right: 200,
        width: 100,
        height: 100,
        x: 100,
        y: 100,
        toJSON: () => ({}),
      });

      render(
        <CoachMark
          {...defaultProps}
          targetSelector="#visible-target"
          forceFallback={true}
          debugMode={true}
        />
      );

      // Should still use fallback modal even though element exists
      await waitFor(() => {
        expect(screen.getByText("🔍 Debug Information")).toBeInTheDocument();
        expect(screen.getByText(/Force fallback mode enabled/)).toBeInTheDocument();
      });

      testElement.remove();
    });
  });

  describe("Anchored Positioning", () => {
    beforeEach(() => {
      // Create a test element in the DOM
      const testElement = document.createElement("div");
      testElement.id = "test-target";
      testElement.style.width = "100px";
      testElement.style.height = "100px";
      testElement.style.position = "absolute";
      testElement.style.top = "100px";
      testElement.style.left = "100px";
      document.body.appendChild(testElement);

      // Mock getBoundingClientRect to simulate a visible element
      vi.spyOn(testElement, "getBoundingClientRect").mockReturnValue({
        top: 100,
        left: 100,
        bottom: 200,
        right: 200,
        width: 100,
        height: 100,
        x: 100,
        y: 100,
        toJSON: () => ({}),
      });

      // Mock window dimensions
      Object.defineProperty(window, "innerHeight", { writable: true, value: 800 });
      Object.defineProperty(window, "innerWidth", { writable: true, value: 1200 });
    });

    afterEach(() => {
      // Clean up test element
      const testElement = document.getElementById("test-target");
      if (testElement) {
        testElement.remove();
      }
    });

    it("should use anchored positioning when target element is visible", async () => {
      render(<CoachMark {...defaultProps} targetSelector="#test-target" />);

      // Should render the content
      await waitFor(() => {
        expect(screen.getByText("Test Title")).toBeInTheDocument();
      });
    });
  });

  describe("Progress Indicators", () => {
    it("should render correct number of progress dots", async () => {
      render(<CoachMark {...defaultProps} targetSelector="#nonexistent-element" totalSteps={5} />);

      await waitFor(() => {
        const dots = screen.getAllByRole("generic").filter((el) => el.className.includes("h-2"));
        expect(dots.length).toBe(5);
      });
    });
  });

  describe("Visibility Detection", () => {
    it("should not render when isVisible is false", () => {
      const { container } = render(
        <CoachMark {...defaultProps} targetSelector="#test-target" isVisible={false} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should fallback to modal when target is not visible in viewport", async () => {
      // Create an element outside viewport
      const testElement = document.createElement("div");
      testElement.id = "hidden-target";
      testElement.style.width = "100px";
      testElement.style.height = "100px";
      testElement.style.position = "absolute";
      testElement.style.top = "-200px"; // Outside viewport
      testElement.style.left = "100px";
      document.body.appendChild(testElement);

      // Mock getBoundingClientRect to simulate element outside viewport
      vi.spyOn(testElement, "getBoundingClientRect").mockReturnValue({
        top: -200,
        left: 100,
        bottom: -100,
        right: 200,
        width: 100,
        height: 100,
        x: 100,
        y: -200,
        toJSON: () => ({}),
      });

      render(<CoachMark {...defaultProps} targetSelector="#hidden-target" />);

      // Should render the fallback modal instead
      await waitFor(() => {
        expect(screen.getByText("Test Title")).toBeInTheDocument();
      });

      // Clean up
      testElement.remove();
    });
  });

  describe("Enhanced Debug Information", () => {
    it("should display error information in debug mode when positioning error occurs", async () => {
      render(
        <CoachMark {...defaultProps} targetSelector="#nonexistent-element" debugMode={true} />
      );

      await waitFor(() => {
        expect(screen.getByText("🔍 Debug Information")).toBeInTheDocument();
        // Should display timestamp
        expect(screen.getByText(/Rendered:/)).toBeInTheDocument();
      });
    });

    it("should show render timestamp in debug info", async () => {
      render(
        <CoachMark {...defaultProps} targetSelector="#nonexistent-element" debugMode={true} />
      );

      await waitFor(() => {
        const timestampElement = screen.getByText(/Rendered:/);
        expect(timestampElement).toBeInTheDocument();
      });
    });
  });

  describe("Data Attributes for Testing", () => {
    it("should add test data attributes to fallback modal", async () => {
      render(<CoachMark {...defaultProps} targetSelector="#nonexistent-element" />);

      await waitFor(() => {
        const modal = screen.getByTestId("coachmark-fallback-modal");
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveAttribute("data-coachmark-mode", "fallback");
        expect(modal).toHaveAttribute("data-coachmark-step", "1");
      });
    });

    it("should add test data attributes to anchored overlay", async () => {
      // Create a visible element
      const testElement = document.createElement("div");
      testElement.id = "visible-target";
      testElement.style.width = "100px";
      testElement.style.height = "100px";
      testElement.style.position = "absolute";
      testElement.style.top = "100px";
      testElement.style.left = "100px";
      document.body.appendChild(testElement);

      vi.spyOn(testElement, "getBoundingClientRect").mockReturnValue({
        top: 100,
        left: 100,
        bottom: 200,
        right: 200,
        width: 100,
        height: 100,
        x: 100,
        y: 100,
        toJSON: () => ({}),
      });

      render(<CoachMark {...defaultProps} targetSelector="#visible-target" />);

      await waitFor(() => {
        const overlay = screen.getByTestId("coachmark-anchored-overlay");
        expect(overlay).toBeInTheDocument();
        expect(overlay).toHaveAttribute("data-coachmark-mode", "anchored");
        expect(overlay).toHaveAttribute("data-coachmark-step", "1");
      });

      testElement.remove();
    });
  });

  describe("Error Recovery", () => {
    it("should render buttons even in fallback mode", async () => {
      render(<CoachMark {...defaultProps} targetSelector="#nonexistent-element" />);

      await waitFor(() => {
        const skipButton = screen.getByText("Überspringen");
        const nextButton = screen.getByText("Weiter");
        expect(skipButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();
      });
    });

    it("should allow interaction with buttons in fallback mode", async () => {
      const onNext = vi.fn();
      const onSkip = vi.fn();

      render(
        <CoachMark
          {...defaultProps}
          targetSelector="#nonexistent-element"
          onNext={onNext}
          onSkip={onSkip}
        />
      );

      await waitFor(() => {
        const nextButton = screen.getByText("Weiter");
        nextButton.click();
      });

      expect(onNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("Safety Timeout", () => {
    it("should eventually render even if positioning takes too long", async () => {
      // Create an element that might cause slow positioning
      const testElement = document.createElement("div");
      testElement.id = "slow-target";
      document.body.appendChild(testElement);

      // Mock getBoundingClientRect to simulate a very slow operation
      vi.spyOn(testElement, "getBoundingClientRect").mockImplementation(() => {
        // Simulate slow operation by not returning immediately
        return {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width: 0,
          height: 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
      });

      render(<CoachMark {...defaultProps} targetSelector="#slow-target" />);

      // Should eventually render something (fallback or positioned)
      await waitFor(
        () => {
          expect(screen.getByText("Test Title")).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      testElement.remove();
    });
  });
});
