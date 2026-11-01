/**
 * EXPORTease AI — Premium Animation System
 * Centralized Framer Motion variants library.
 *
 * Rules:
 *  - Durations: 0.5s – 1.2s
 *  - Stagger groups: 80ms – 150ms
 *  - Easing: ease-out / spring-feel cubic-bezier [0.16, 1, 0.3, 1]
 *  - Animations trigger ONCE on viewport entry
 *  - Fully respects prefers-reduced-motion (handled in CSS)
 */

// ─── Shared Easing ───────────────────────────────────────────────────────────
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1];
export const EASE_IN_OUT = [0.4, 0, 0.2, 1];

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
      staggerChildren: 0.07,
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

// ─── Fade + Translate Up (hero text, section headers) ────────────────────────
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT_EXPO },
  },
};

// ─── Fade In (subtle elements, overlays) ─────────────────────────────────────
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ─── Scale + Fade In (cards, panels) ─────────────────────────────────────────
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.93, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

// ─── Blur → Clear (hero image, 3D canvas, key visuals) ───────────────────────
export const blurIn = {
  hidden: { opacity: 0, filter: 'blur(12px)', scale: 0.97 },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: { duration: 0.85, ease: EASE_OUT_EXPO },
  },
};

// ─── Slide In from Left ───────────────────────────────────────────────────────
export const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

// ─── Slide In from Right ──────────────────────────────────────────────────────
export const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

// ─── Slide Down (navbar, top banners) ────────────────────────────────────────
export const slideDown = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

// ─── Stagger Container (parent wrapper for staggered children) ────────────────
export const staggerContainer = (staggerDelay = 0.08, delayChildren = 0.05) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

// ─── Stagger Item (child of stagger container, use with fadeUp/scaleIn) ──────
export const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
};

// ─── Table Row Reveal (row-by-row stagger) ────────────────────────────────────
export const tableRowVariant = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: EASE_OUT_QUART },
  },
};

// ─── Hover Card Lift (whileHover prop) ───────────────────────────────────────
export const cardHover = {
  y: -3,
  transition: { duration: 0.2, ease: 'easeOut' },
};

// ─── Hover Button Scale ───────────────────────────────────────────────────────
export const buttonHover = {
  scale: 1.025,
  transition: { duration: 0.18, ease: 'easeOut' },
};

// ─── Tap Feedback ────────────────────────────────────────────────────────────
export const tapScale = { scale: 0.97 };

// ─── Shared viewport config for whileInView ───────────────────────────────────
export const viewportOnce = { once: true, margin: '-60px' };
export const viewportEager = { once: true, margin: '-30px' };
