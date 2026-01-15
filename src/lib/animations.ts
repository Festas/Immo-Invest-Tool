/**
 * Reusable animation configurations for the application
 * These animations are designed to be subtle, purposeful, and respect user preferences
 */

// Animation durations (in ms)
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  number: 800,
} as const;

// Animation easing functions
export const EASING = {
  easeOut: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  easeIn: "cubic-bezier(0.55, 0.09, 0.68, 0.53)",
  easeInOut: "cubic-bezier(0.45, 0, 0.55, 1)",
  spring: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
} as const;

// Fade animations
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
};

// Slide animations
export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
};

export const slideInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
};

export const slideInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
};

// Scale animations
export const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { duration: ANIMATION_DURATION.fast / 1000, ease: EASING.easeOut },
};

export const scaleUp = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.spring },
};

// Hover animations
export const hoverLift = {
  hover: {
    y: -2,
    boxShadow: "0 12px 24px -4px rgba(100, 116, 139, 0.15)",
    transition: { duration: ANIMATION_DURATION.fast / 1000 },
  },
};

export const hoverScale = {
  hover: {
    scale: 1.05,
    transition: { duration: ANIMATION_DURATION.fast / 1000 },
  },
};

export const hoverGlow = {
  hover: {
    boxShadow: "0 0 20px rgba(79, 70, 229, 0.3)",
    borderColor: "rgba(79, 70, 229, 0.5)",
    transition: { duration: ANIMATION_DURATION.fast / 1000 },
  },
};

// Stagger animations (for lists/grids)
export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerChildrenFast = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Spring configurations
export const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const softSpringConfig = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

export const bouncySpringConfig = {
  type: "spring",
  stiffness: 400,
  damping: 20,
};

// Utility function to check for reduced motion preference
export const shouldReduceMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Utility function to get animation with reduced motion fallback
export const withReducedMotion = (animation: Record<string, unknown>): Record<string, unknown> => {
  if (shouldReduceMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.01 },
    };
  }
  return animation;
};

// Number animation utilities
export const numberAnimationConfig = {
  duration: ANIMATION_DURATION.number,
  easing: (t: number) => 1 - Math.pow(1 - t, 3), // ease-out-cubic
};

// Color flash durations for value changes
export const VALUE_CHANGE_FLASH_DURATION = 600; // ms

// Color values for value changes
export const VALUE_CHANGE_COLORS = {
  increase: "rgba(34, 197, 94, 0.2)", // green
  decrease: "rgba(239, 68, 68, 0.2)", // red
  neutral: "transparent",
} as const;

// Toast animation configurations
export const toastAnimations = {
  slideInFromBottom: {
    initial: { opacity: 0, y: 100, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 100, scale: 0.95 },
    transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
  },
  slideInFromRight: {
    initial: { opacity: 0, x: 100, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 100, scale: 0.95 },
    transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
  },
};

// Modal/Dialog animations
export const modalAnimations = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: ANIMATION_DURATION.fast / 1000 },
  },
  content: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
  },
};

// Spotlight animation for onboarding
export const spotlightAnimation = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
  transition: { duration: ANIMATION_DURATION.slow / 1000, ease: EASING.easeOut },
};

// Page transition animations
export const pageTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: ANIMATION_DURATION.fast / 1000 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
  },
};
