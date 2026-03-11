/**
 * tokens.js — Centralized Design Tokens
 *
 * PURPOSE: Single source of truth for ALL visual values in the app.
 * Every color, spacing value, font, shadow, and radius lives here.
 * Import from this file instead of hardcoding values in components.
 *
 * AESTHETIC: "Notion Calendar / Cron" — Clinical, sharp, and airy.
 *   - Pure white canvas, no dark mode gimmicks
 *   - Whitespace for separation, not shadows or heavy borders
 *   - Single accent color (Electric Blue) for focus
 *   - Inter typeface — the SaaS workhorse
 *   - tabular-nums for all time/data displays
 */

// ─── COLOR PALETTE ───────────────────────────────────────────────
// Light-mode, high-density palette inspired by Notion Calendar / Cron.
// Each semantic color has a main + ghost (10% bg) + border variant.
export const colors = {
  // Surfaces — layered whites
  bg: {
    deep:    '#FFFFFF',          // page canvas
    base:    '#FFFFFF',          // card / panel backgrounds
    raised:  '#F9FAFB',         // sidebar, header, input resting bg
    overlay: '#FFFFFF',         // modals sit on white with border
  },

  // Primary accent — single "Electric Blue"
  primary: {
    main:    '#006ADC',          // buttons, links, active indicators
    light:   '#0081F1',          // hover
    dark:    '#004DA8',          // pressed
    ghost:   'rgba(0, 106, 220, 0.08)',   // selected-row / ghost bg
    border:  'rgba(0, 106, 220, 0.30)',   // focus rings
    glow:    'rgba(0, 106, 220, 0.15)',   // kept for compat — very subtle
  },

  // Secondary — neutral grey (tags, secondary actions)
  secondary: {
    main:    '#6B7280',
    light:   '#9CA3AF',
    ghost:   'rgba(107, 114, 128, 0.08)',
    border:  'rgba(107, 114, 128, 0.20)',
  },

  // Warning — warm amber (exams, deadlines)
  warning: {
    main:    '#D97706',
    light:   '#F59E0B',
    ghost:   'rgba(217, 119, 6, 0.10)',
    border:  'rgba(217, 119, 6, 0.25)',
  },

  // Error / Danger
  error: {
    main:    '#DC2626',
    light:   '#EF4444',
    ghost:   'rgba(220, 38, 38, 0.08)',
    border:  'rgba(220, 38, 38, 0.20)',
  },

  // Success
  success: {
    main:    '#16A34A',
    light:   '#22C55E',
    ghost:   'rgba(22, 163, 74, 0.08)',
    border:  'rgba(22, 163, 74, 0.20)',
  },

  // Info — calm blue (labs, networking)
  info: {
    main:    '#2563EB',
    ghost:   'rgba(37, 99, 235, 0.08)',
  },

  // Text — high-contrast dark hierarchy
  text: {
    primary:   '#111827',         // headings, key info
    secondary: '#6B7280',         // body text, descriptions
    muted:     '#9CA3AF',         // labels, captions
    disabled:  '#D1D5DB',         // disabled states
  },

  // Borders — thin, nearly invisible lines
  border: {
    subtle:  '#F3F4F6',           // card edges, grid lines
    medium:  '#E5E7EB',           // input borders, dividers
    strong:  '#D1D5DB',           // focused/hovered inputs
  },
}

// ─── TYPOGRAPHY ──────────────────────────────────────────────────
// "Inter" everywhere — clean, neutral, built for UI.
// tabular-nums ensures columns of numbers align perfectly (Cron-style).
export const fonts = {
  heading:  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  body:     '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

  // High-density modular scale
  size: {
    xs:     '0.6875rem',   // 11px — captions, badges
    sm:     '0.75rem',     // 12px — labels, small text
    base:   '0.8125rem',   // 13px — body text (Cron density)
    md:     '0.875rem',    // 14px — slightly larger body
    lg:     '1rem',        // 16px — subheadings
    xl:     '1.25rem',     // 20px — section headings
    '2xl':  '1.5rem',      // 24px — page titles
    '3xl':  '2rem',        // 32px — hero / display
  },

  weight: {
    regular: 400,
    medium:  500,
    semibold: 600,
    bold:    600,           // alias — Inter looks best at 600, not 700
  },

  letterSpacing: {
    tight:   '-0.011em',
    normal:  '0em',
    wide:    '0.01em',
    wider:   '0.02em',
    widest:  '0.04em',
  },
}

// ─── SPACING SCALE ───────────────────────────────────────────────
// Strict 4px grid — high-density, Notion-style compactness
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

// ─── BORDER RADIUS ───────────────────────────────────────────────
// Strict small radii — sharp, clinical feel. No pillowy curves.
export const radius = {
  sm:   '4px',
  md:   '6px',
  lg:   '8px',
  xl:   '8px',            // same as lg — no large curves in this system
  full: '9999px',
}

// ─── SHADOWS ─────────────────────────────────────────────────────
// Nearly eliminated. Borders replace depth cues.
// Kept as exports so existing code doesn't crash.
export const shadows = {
  sm:    'none',
  md:    'none',
  lg:    '0 1px 3px rgba(0,0,0,0.06)',   // very subtle for dropdowns only
  xl:    '0 4px 12px rgba(0,0,0,0.08)',   // modal shadow — barely there
  glow:  'none',
  inner: 'none',
}

// ─── TRANSITIONS ─────────────────────────────────────────────────
// Snappy — desktop-app speed, not web-animation fluff
export const transitions = {
  fast:    'all 0.1s ease',
  normal:  'all 0.15s ease',
  smooth:  'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce:  'all 0.15s ease',
}

// ─── KEYFRAME ANIMATION NAMES ────────────────────────────────────
// Minimal, subtle entrance animations
export const animations = {
  fadeUp:    'fadeUp 0.25s ease both',
  fadeIn:    'fadeIn 0.2s ease both',
  slideIn:   'slideInRight 0.2s ease both',
  pulse:     'none',            // removed: too flashy for this aesthetic
  shimmer:   'none',            // removed: clinical apps don't shimmer
  float:     'none',            // removed: no floating orbs
}

// ─── SURFACE PRESET ──────────────────────────────────────────────
// Replaces the old glassmorphism. Clean, bordered card.
// Kept as `glass` export name so existing component code doesn't break.
export const glass = {
  background: '#FFFFFF',
  backdropFilter: 'none',
  border: `1px solid ${colors.border.subtle}`,
  borderRadius: radius.md,
}

