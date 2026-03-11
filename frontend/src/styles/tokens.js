/**
 * tokens.js — Centralized Design Tokens
 *
 * PURPOSE: Single source of truth for ALL visual values.
 * Every color, font, spacing, and radius lives here.
 *
 * AESTHETIC: "Notion meets Linear" — warm neutrals, deep slate accent,
 * DM Sans typeface, purposeful whitespace, no decoration.
 *
 * BRAND: Smart Timetable (part of DISHA)
 */

// ─── COLOR PALETTE ───────────────────────────────────────────────
export const colors = {
  // Surfaces — warm layered whites
  bg: {
    deep:    '#FAFAFA',          // page canvas — warm off-white
    base:    '#FFFFFF',          // cards, panels — pure white
    raised:  '#F4F4F5',         // sidebar, input resting bg
    overlay: '#FFFFFF',         // modals
  },

  // Primary accent — Deep Slate Blue
  primary: {
    main:    '#1E3A5F',
    light:   '#2B4F7E',
    dark:    '#15294A',
    ghost:   'rgba(30, 58, 95, 0.06)',
    border:  'rgba(30, 58, 95, 0.25)',
    glow:    'rgba(30, 58, 95, 0.10)',
  },

  // Secondary — warm slate
  secondary: {
    main:    '#64748B',
    light:   '#94A3B8',
    ghost:   'rgba(100, 116, 139, 0.06)',
    border:  'rgba(100, 116, 139, 0.15)',
  },

  warning: {
    main:    '#D97706',
    light:   '#F59E0B',
    ghost:   'rgba(217, 119, 6, 0.08)',
    border:  'rgba(217, 119, 6, 0.20)',
  },

  error: {
    main:    '#DC2626',
    light:   '#EF4444',
    ghost:   'rgba(220, 38, 38, 0.06)',
    border:  'rgba(220, 38, 38, 0.15)',
  },

  success: {
    main:    '#16A34A',
    light:   '#22C55E',
    ghost:   'rgba(22, 163, 74, 0.06)',
    border:  'rgba(22, 163, 74, 0.15)',
  },

  info: {
    main:    '#2563EB',
    ghost:   'rgba(37, 99, 235, 0.06)',
  },

  text: {
    primary:   '#111827',
    secondary: '#4B5563',
    muted:     '#94A3B8',
    disabled:  '#D1D5DB',
  },

  border: {
    subtle:  '#F0F0F1',
    medium:  '#E2E4E9',
    strong:  '#CBD5E1',
  },
}

// ─── TYPOGRAPHY ──────────────────────────────────────────────────
export const fonts = {
  heading:  '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  body:     '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

  size: {
    xs:     '0.6875rem',
    sm:     '0.75rem',
    base:   '0.8125rem',
    md:     '0.875rem',
    lg:     '1rem',
    xl:     '1.25rem',
    '2xl':  '1.5rem',
    '3xl':  '1.75rem',
  },

  weight: {
    regular: 400,
    medium:  500,
    semibold: 600,
    bold:    700,
  },

  letterSpacing: {
    tight:   '-0.015em',
    normal:  '0em',
    wide:    '0.01em',
    wider:   '0.025em',
    widest:  '0.06em',
  },
}

// ─── SPACING SCALE ───────────────────────────────────────────────
export const spacing = {
  0:   '0px',
  0.5: '2px',
  1:   '4px',
  1.5: '6px',
  2:   '8px',
  2.5: '10px',
  3:   '12px',
  4:   '16px',
  5:   '20px',
  6:   '24px',
  8:   '32px',
  10:  '40px',
  12:  '48px',
  16:  '64px',
}

export const radius = {
  sm:   '4px',
  md:   '8px',
  lg:   '10px',
  xl:   '12px',
  full: '9999px',
}

export const shadows = {
  sm:    '0 1px 2px rgba(0,0,0,0.04)',
  md:    '0 2px 4px rgba(0,0,0,0.06)',
  lg:    '0 4px 12px rgba(0,0,0,0.08)',
  xl:    '0 8px 24px rgba(0,0,0,0.10)',
  glow:  'none',
  inner: 'none',
}

export const transitions = {
  fast:    'all 0.1s ease',
  normal:  'all 0.15s ease',
  smooth:  'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce:  'all 0.15s ease',
}

export const animations = {
  fadeUp:    'fadeUp 0.3s ease both',
  fadeIn:    'fadeIn 0.2s ease both',
  slideIn:   'slideInRight 0.2s ease both',
  pulse:     'none',
  shimmer:   'none',
  float:     'none',
}

export const glass = {
  background: '#FFFFFF',
  backdropFilter: 'none',
  border: '1px solid #E2E4E9',
  borderRadius: '8px',
}
