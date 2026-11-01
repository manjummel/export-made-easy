/**
 * Animation presets for Framer Motion
 * Centralizes all animation variants to ensure consistent motion design.
 * Enhanced with premium easing curves and richer effects.
 */

// ─── Shared Easing Curves ─────────────────────────────────────────────────────
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1];
export const EASE_IN_OUT = [0.4, 0, 0.2, 1];

// ─── Fade In ──────────────────────────────────────────────────────────────────
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ─── Fade + Translate Up (hero text, headings) ────────────────────────────────
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT_EXPO },
  },
};

// ─── Alias kept for backwards compat
export const fadeUp = fadeInUp;

// ─── Fade + Translate Down (navbar, top banners) ─────────────────────────────
export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

export const slideDown = fadeInDown;

// ─── Fade + Slide from Left ───────────────────────────────────────────────────
export const fadeInLeft = {
  hidden: { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

export const slideInLeft = fadeInLeft;

// ─── Fade + Slide from Right ──────────────────────────────────────────────────
export const fadeInRight = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

export const slideInRight = fadeInRight;

// ─── Scale + Fade In (cards, panels, images) ──────────────────────────────────
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.93, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

// ─── Blur → Clear (hero visuals, 3D canvas) ───────────────────────────────────
export const blurIn = {
  hidden: { opacity: 0, filter: 'blur(12px)', scale: 0.97 },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: { duration: 0.85, ease: EASE_OUT_EXPO },
  },
};

// ─── Page-Level Transition ────────────────────────────────────────────────────
export const pageVariants = {
  hidden: {
    opacity: 0,
    y: 16,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
      ease: EASE_OUT_EXPO,
      when: 'beforeChildren',
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(2px)',
    transition: {
      duration: 0.3,
      ease: EASE_IN_OUT,
    },
  },
};

// ─── Stagger Container ────────────────────────────────────────────────────────
/** Stagger children on a container */
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// ─── Stagger Item (premium, used with staggerContainer) ───────────────────────
export const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
};

/** Child item for stagger lists */
export const listItem = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.38, ease: EASE_OUT_EXPO } },
};

// ─── Table Row Stagger ────────────────────────────────────────────────────────
export const tableRowVariant = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: EASE_OUT_QUART },
  },
};

// ─── Slide in from bottom for modals/sheets ───────────────────────────────────
export const slideUp = {
  hidden: { opacity: 0, y: '100%' },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 28, stiffness: 300 } },
  exit: { opacity: 0, y: '100%', transition: { duration: 0.2 } },
};

// ─── Backdrop for modals ──────────────────────────────────────────────────────
export const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// ─── Number counter animation helper ──────────────────────────────────────────
export const numberCounterVariants = {
  hidden: { opacity: 0 },
  visible: (custom) => ({
    opacity: 1,
    transition: { delay: custom * 0.1, duration: 0.4 },
  }),
};

// ─── Shared viewport config ───────────────────────────────────────────────────
export const viewportOnce = { once: true, margin: '-60px' };
export const viewportEager = { once: true, margin: '-30px' };

// ─── Hover/Tap Presets ────────────────────────────────────────────────────────
export const cardHover = {
  y: -3,
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const buttonHover = {
  scale: 1.025,
  transition: { duration: 0.18, ease: 'easeOut' },
};

export const tapScale = { scale: 0.97 };

// ─── Animation Components ─────────────────────────────────────────────────────
export { default as AnimatedPage } from './AnimatedPage';
export { default as AnimatedSection } from './AnimatedSection';
export { default as AnimatedCard, AnimatedCardGroup } from './AnimatedCard';
