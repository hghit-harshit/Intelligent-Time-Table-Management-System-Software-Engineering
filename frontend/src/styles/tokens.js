/**
 * tokens.js — Centralized Design Tokens
 * 
 * PURPOSE: Single source of truth for ALL visual values in the app.
 * Every color, spacing value, font, shadow, and radius lives here.
 * Import from this file instead of hardcoding values in components.
 * 
 * AESTHETIC: "Dark Utilitarian Academic"
 *   - Deep charcoal backgrounds for reduced eye strain
 *   - Electric teal accent for primary actions and highlights
 *   - Monospaced accents for time/data — feels institutional
 *   - Sharp, clean borders — utilitarian, no fluff
 */

// ─── COLOR PALETTE ───────────────────────────────────────────────
// Each color has a base + alpha variants for backgrounds/borders
export const colors = {
  // Base surfaces — layered dark backgrounds
  bg: {
    deep:    '#0C0C0E',    // deepest background (body, full-page)
    base:    '#111114',    // primary surface (cards, sidebar)
    raised:  '#18181C',    // elevated surface (modals, dropdowns)
    overlay: '#1E1E24',    // highest surface (tooltips, popovers)
  },

  // Primary accent — electric teal
  primary: {
    main:    '#2DD4BF',    // buttons, links, active states
    light:   '#5EEAD4',    // hover states
    dark:    '#14B8A6',    // pressed states
    ghost:   'rgba(45, 212, 191, 0.08)',   // ghost backgrounds
    border:  'rgba(45, 212, 191, 0.25)',   // subtle borders
    glow:    'rgba(45, 212, 191, 0.4)',    // box-shadow glow
  },

  // Secondary — muted lavender (for tags, secondary info)
  secondary: {
    main:    '#A78BFA',
    light:   '#C4B5FD',
    ghost:   'rgba(167, 139, 250, 0.08)',
    border:  'rgba(167, 139, 250, 0.25)',
  },

  // Warning — warm amber (exams, deadlines, rescheduled)
  warning: {
    main:    '#F59E0B',
    light:   '#FBBF24',
    ghost:   'rgba(245, 158, 11, 0.10)',
    border:  'rgba(245, 158, 11, 0.25)',
  },

  // Error / Danger — sharp red
  error: {
    main:    '#EF4444',
    light:   '#F87171',
    ghost:   'rgba(239, 68, 68, 0.10)',
    border:  'rgba(239, 68, 68, 0.25)',
  },

  // Success — confident green
  success: {
    main:    '#22C55E',
    light:   '#4ADE80',
    ghost:   'rgba(34, 197, 94, 0.10)',
    border:  'rgba(34, 197, 94, 0.25)',
  },

  // Info — calm blue (labs, networking)
  info: {
    main:    '#3B82F6',
    ghost:   'rgba(59, 130, 246, 0.15)',
  },

  // Text — layered opacity for hierarchy
  text: {
    primary:   '#F1F5F9',    // headings, key info
    secondary: '#94A3B8',    // body text, descriptions
    muted:     '#64748B',    // labels, captions
    disabled:  '#475569',    // disabled states
  },

  // Borders
  border: {
    subtle:  'rgba(255, 255, 255, 0.06)',  // default card borders
    medium:  'rgba(255, 255, 255, 0.12)',  // input borders
    strong:  'rgba(255, 255, 255, 0.20)',  // focused input borders
  },
}

// ─── TYPOGRAPHY ──────────────────────────────────────────────────
// "Instrument Serif" for headings — editorial, distinctive
// "JetBrains Mono" for body/data — utilitarian, great for schedules
export const fonts = {
  heading:  '"Instrument Serif", Georgia, serif',
  body:     '"JetBrains Mono", "Fira Code", monospace',
  
  // Font sizes following a modular scale (1.25 ratio)
  size: {
    xs:     '0.6875rem',   // 11px — captions, badges
    sm:     '0.75rem',     // 12px — labels, small text
    base:   '0.8125rem',   // 13px — body text
    md:     '0.875rem',    // 14px — slightly larger body
    lg:     '1.125rem',    // 18px — subheadings
    xl:     '1.5rem',      // 24px — section headings
    '2xl':  '2rem',        // 32px — page titles
    '3xl':  '2.5rem',      // 40px — hero/display
  },

  weight: {
    regular: 400,
    medium:  500,
    bold:    700,
  },

  letterSpacing: {
    tight:   '-0.01em',
    normal:  '0em',
    wide:    '0.05em',
    wider:   '0.1em',
    widest:  '0.15em',
  },
}

// ─── SPACING SCALE ───────────────────────────────────────────────
// Consistent 4px base unit
export const spacing = {
  0:   '0px',
  1:   '4px',
  2:   '8px',
  3:   '12px',
  4:   '16px',
  5:   '20px',
  6:   '24px',
  8:   '32px',
  10:  '40px',
  12:  '48px',
  16:  '64px',
}

// ─── BORDER RADIUS ───────────────────────────────────────────────
export const radius = {
  sm:   '6px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  full: '9999px',
}

// ─── SHADOWS ─────────────────────────────────────────────────────
export const shadows = {
  sm:    '0 2px 8px rgba(0, 0, 0, 0.3)',
  md:    '0 8px 24px rgba(0, 0, 0, 0.4)',
  lg:    '0 16px 48px rgba(0, 0, 0, 0.5)',
  xl:    '0 24px 64px rgba(0, 0, 0, 0.6)',
  glow:  `0 0 20px ${colors.primary.glow}`,
  inner: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
}

// ─── TRANSITIONS ─────────────────────────────────────────────────
export const transitions = {
  fast:    'all 0.15s ease',
  normal:  'all 0.25s ease',
  smooth:  'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce:  'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
}

// ─── KEYFRAME ANIMATION NAMES ────────────────────────────────────
// CSS keyframes defined in index.css, referenced here for consistency
export const animations = {
  fadeUp:    'fadeUp 0.5s ease both',
  fadeIn:    'fadeIn 0.3s ease both',
  slideIn:   'slideInRight 0.4s ease both',
  pulse:     'pulseGlow 2s infinite',
  shimmer:   'shimmer 3s linear infinite',
  float:     'float 8s ease-in-out infinite',
}

// ─── GLASS MORPHISM PRESET ───────────────────────────────────────
// Reusable glass card style values
export const glass = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(16px)',
  border: `1px solid ${colors.border.subtle}`,
  borderRadius: radius.xl,
}
