# CoachMark and Onboarding Enhancements

## Overview

This document describes the enhancements made to the CoachMark and Onboarding components to ensure robust fallback rendering and prevent users from getting stuck on mobile devices.

## Key Improvements

### 1. **Guaranteed Fallback Modal Rendering**

The CoachMark component now guarantees that a visible, interactive modal will **always** appear, even when:

- Target element is not found in the DOM
- Target element exists but is outside the viewport
- Any positioning logic fails or throws an error
- Positioning takes too long (>1 second safety timeout)

**How it works:**

- Error boundary wrapper catches all rendering errors
- Try-catch blocks wrap all positioning logic
- Safety timeout forces fallback after 1 second if positioning isn't complete
- All failure paths lead to a centered, fully interactive modal

### 2. **Enhanced Scroll Lock Management**

**Problem:** On mobile, scroll locks could persist between step transitions, leaving users unable to interact.

**Solution:**

- Scroll lock cleanup wrapped in try-catch to handle edge cases
- Explicit restoration of `overflow` and `position:fixed` styles
- Cleanup called on every transition (next, skip, close)
- Cleanup on component unmount as safety net
- Debug logging to track scroll restoration

### 3. **Debug Mode**

Enable debug mode to see diagnostic information about why fallback is triggered:

**Environment Variables:**

```bash
NEXT_PUBLIC_COACHMARK_DEBUG=true       # Enable debug information overlay
NEXT_PUBLIC_COACHMARK_FORCE_FALLBACK=true  # Force fallback mode for testing
```

**Component Props:**

```tsx
<CoachMark
  debugMode={true} // Show debug info
  forceFallback={true} // Force fallback modal
  // ... other props
/>
```

**Debug Information Displayed:**

- Target selector or ref identifier
- Whether target was found
- Visibility status (partially/fully visible)
- Bounding rectangle coordinates
- Fallback reason (why modal was shown instead of anchored)
- Any positioning errors
- Render timestamp

### 4. **Data Attributes for Testing**

All overlays now include test-friendly data attributes:

**Fallback Modal:**

```html
<div
  data-testid="coachmark-fallback-modal"
  data-coachmark-mode="fallback"
  data-coachmark-step="1"
  data-coachmark-overlay="true"
></div>
```

**Anchored Overlay:**

```html
<div
  data-testid="coachmark-anchored-overlay"
  data-coachmark-mode="anchored"
  data-coachmark-step="1"
  data-coachmark-overlay="true"
></div>
```

**Error Fallback:**

```html
<div data-testid="coachmark-error-fallback" data-coachmark-mode="error-fallback"></div>
```

### 5. **Error Boundary Protection**

An error boundary wraps the CoachMark component to catch any rendering errors:

- If any error occurs during rendering, shows fallback modal with error message
- Users can still navigate (Next/Skip buttons always work)
- Error is logged to console for debugging
- Progress dots and step indicators still shown

### 6. **Safety Timeout**

A 1-second safety timeout ensures the UI never gets stuck:

```typescript
// If positioning logic hasn't completed after 1 second, force fallback
setTimeout(() => {
  if (!isReady) {
    setUseFallbackModal(true);
    setIsReady(true);
  }
}, 1000);
```

This prevents edge cases where:

- DOM queries hang
- Element measurements fail
- Async positioning logic stalls

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm test -- --run     # Run tests without watch mode
```

### Test Coverage

**CoachMark Tests (18 tests):**

- Fallback modal rendering
- Debug mode information display
- Force fallback mode
- Anchored positioning
- Progress indicators
- Visibility detection
- Data attributes
- Error recovery
- Safety timeout

**Onboarding Tests (8 tests):**

- Scroll lock restoration on unmount
- Scroll lock restoration on skip
- Step transition handling
- localStorage persistence
- Error handling

### Manual Testing

1. **Test Fallback Mode:**

   ```tsx
   <CoachMark
     targetSelector="#nonexistent"
     debugMode={true}
     // ... other props
   />
   ```

   Should show centered modal with debug info

2. **Test Anchored Mode:**

   ```tsx
   <CoachMark
     targetSelector="#existing-visible-element"
     debugMode={true}
     // ... other props
   />
   ```

   Should show spotlight and popover

3. **Test Error Recovery:**
   ```tsx
   <CoachMark
     targetRef={invalidRef} // Pass invalid ref
     debugMode={true}
     // ... other props
   />
   ```
   Should fallback to modal gracefully

## Troubleshooting

### Issue: Modal not appearing

**Check:**

1. Is `isVisible={true}`?
2. Check browser console for errors
3. Enable `debugMode={true}` to see diagnostic info

### Issue: Scroll locked after closing

**Check:**

1. Verify cleanup is being called (check console in dev mode)
2. Check `document.body.style.overflow` in browser devtools
3. Component should restore scroll automatically

### Issue: Target element not being highlighted

**Likely causes:**

1. Element not in viewport → Falls back to modal (expected)
2. Element hidden → Falls back to modal (expected)
3. Selector incorrect → Falls back to modal (expected)

**To debug:**
Enable `debugMode={true}` and check the debug panel for:

- Whether target was found
- Visibility status
- Fallback reason

## API Reference

### CoachMark Props

```typescript
interface CoachMarkProps {
  targetRef?: React.RefObject<HTMLElement | null>;
  targetSelector?: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  step: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  isVisible: boolean;
  isLastStep?: boolean;
  forceFallback?: boolean; // NEW: Force fallback mode
  debugMode?: boolean; // NEW: Show debug information
}
```

### Debug Info Structure

```typescript
interface DebugInfo {
  targetSelector: string;
  targetFound: boolean;
  boundingRect: DOMRect | null;
  fallbackReason: string;
  isPartiallyVisible: boolean;
  isFullyVisible: boolean;
  renderTimestamp: number; // NEW: When modal was rendered
  positioningError: string | null; // NEW: Any positioning errors
}
```

## Best Practices

1. **Always provide both title and description** - They're shown in all modes
2. **Use targetSelector for elements that might not exist yet** - Fallback is automatic
3. **Test on mobile devices** - Viewport detection works differently
4. **Enable debug mode during development** - Helps identify issues early
5. **Don't worry about edge cases** - Fallback handles them automatically

## Migration Guide

No breaking changes! All existing CoachMark usages continue to work.

**Optional enhancements:**

```tsx
// Before
<CoachMark
  targetSelector="#my-element"
  title="Step 1"
  description="..."
  // ... other props
/>

// After (with enhancements)
<CoachMark
  targetSelector="#my-element"
  title="Step 1"
  description="..."
  debugMode={process.env.NODE_ENV === 'development'}  // Optional
  // ... other props
/>
```

## Performance Considerations

- Error boundary: Minimal overhead, only active when errors occur
- Safety timeout: 1 second timeout per CoachMark instance (negligible)
- Debug mode: Only active when explicitly enabled
- Try-catch blocks: No measurable performance impact

## Browser Support

Tested and working on:

- Chrome/Edge (desktop and mobile)
- Firefox (desktop and mobile)
- Safari (desktop and mobile)
- All modern browsers with ES6+ support
