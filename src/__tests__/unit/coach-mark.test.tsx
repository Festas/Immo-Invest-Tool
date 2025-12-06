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

      // Wait for the component to detect the missing element and render fallback
      await waitFor(() => {
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("[CoachMark] Target not found")
        );
      });

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining("[CoachMark] Falling back to centered modal")
        );
      });

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

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining("[CoachMark] Target element found")
        );
      });

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

    it("should log when target is not visible in viewport", async () => {
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

      await waitFor(() => {
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("[CoachMark] Target element is not visible in viewport")
        );
      });

      // Clean up
      testElement.remove();
    });
  });
});
