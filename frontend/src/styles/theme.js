/**
 * theme.js — MUI Theme Configuration
 *
 * PURPOSE: Creates a Material UI theme that maps our design tokens
 * into MUI's theming system. Every MUI component (Button, TextField,
 * Card, etc.) automatically inherits this visual language.
 *
 * AESTHETIC: "Notion Calendar / Cron" — Clinical, airy, borderline
 * obsessively clean. No shadows, no rounded-pill buttons, no ripple.
 * Depth is communicated with 1px borders, not elevation.
 */

import { createTheme } from '@mui/material/styles'
import { colors, fonts, radius, shadows, transitions } from './tokens'

const theme = createTheme({
  // ─── PALETTE ─────────────────────────────────────────────────
  palette: {
    mode: 'light',
    primary: {
      main:  colors.primary.main,
      light: colors.primary.light,
      dark:  colors.primary.dark,
    },
    secondary: {
      main:  colors.secondary.main,
      light: colors.secondary.light,
    },
    warning: {
      main:  colors.warning.main,
      light: colors.warning.light,
    },
    error: {
      main:  colors.error.main,
      light: colors.error.light,
    },
    success: {
      main:  colors.success.main,
      light: colors.success.light,
    },
    background: {
      default: colors.bg.deep,
      paper:   colors.bg.base,
    },
    text: {
      primary:   colors.text.primary,
      secondary: colors.text.secondary,
      disabled:  colors.text.disabled,
    },
    divider: colors.border.medium,
  },

  // ─── TYPOGRAPHY ──────────────────────────────────────────────
  typography: {
    fontFamily: fonts.body,
    // Enable tabular-nums globally for perfect column alignment
    fontVariantNumeric: 'tabular-nums',

    h1: {
      fontFamily: fonts.heading,
      fontSize:   fonts.size['3xl'],
      fontWeight: fonts.weight.semibold,
      lineHeight: 1.2,
      letterSpacing: fonts.letterSpacing.tight,
      color: colors.text.primary,
    },
    h2: {
      fontFamily: fonts.heading,
      fontSize:   fonts.size['2xl'],
      fontWeight: fonts.weight.semibold,
      lineHeight: 1.25,
      letterSpacing: fonts.letterSpacing.tight,
      color: colors.text.primary,
    },
    h3: {
      fontFamily: fonts.heading,
      fontSize:   fonts.size.xl,
      fontWeight: fonts.weight.semibold,
      lineHeight: 1.3,
      color: colors.text.primary,
    },
    h4: {
      fontFamily: fonts.heading,
      fontSize:   fonts.size.lg,
      fontWeight: fonts.weight.medium,
      lineHeight: 1.4,
      color: colors.text.primary,
    },
    h5: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.md,
      fontWeight: fonts.weight.medium,
      letterSpacing: fonts.letterSpacing.wide,
      color: colors.text.secondary,
    },
    h6: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.sm,
      fontWeight: fonts.weight.medium,
      letterSpacing: fonts.letterSpacing.wider,
      textTransform: 'uppercase',
      color: colors.text.muted,
    },
    body1: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.base,
      fontWeight: fonts.weight.regular,
      lineHeight: 1.6,
      color: colors.text.primary,
    },
    body2: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.sm,
      fontWeight: fonts.weight.regular,
      lineHeight: 1.5,
      color: colors.text.secondary,
    },
    caption: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.xs,
      fontWeight: fonts.weight.regular,
      letterSpacing: fonts.letterSpacing.wide,
      color: colors.text.muted,
    },
    button: {
      fontFamily:    fonts.body,
      fontSize:      fonts.size.sm,
      fontWeight:    fonts.weight.medium,
      letterSpacing: fonts.letterSpacing.normal,
      textTransform: 'none',          // Notion never uppercases buttons
    },
  },

  // ─── SHAPE ───────────────────────────────────────────────────
  shape: {
    borderRadius: parseInt(radius.md),
  },

  // ─── COMPONENT OVERRIDES ─────────────────────────────────────
  components: {

    // ── Global CSS baseline ──
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.bg.deep,
          color: colors.text.primary,
          fontFamily: fonts.body,
          fontVariantNumeric: 'tabular-nums',
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
          '&::-webkit-scrollbar':       { width: '6px' },
          '&::-webkit-scrollbar-track': { background: colors.bg.raised },
          '&::-webkit-scrollbar-thumb': { background: colors.border.strong, borderRadius: '3px' },
          '&::-webkit-scrollbar-thumb:hover': { background: colors.text.muted },
        },
      },
    },

    // ── BUTTON — tight, flat, no ripple ──
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          padding: '4px 12px',
          transition: transitions.fast,
          fontFamily: fonts.body,
          fontSize: fonts.size.sm,
          fontWeight: fonts.weight.medium,
          textTransform: 'none',
          minHeight: 32,
          boxShadow: 'none',
          '&:hover':  { boxShadow: 'none' },
          '&:active': { transform: 'scale(0.98)' },
        },
        contained: {
          backgroundColor: colors.primary.main,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: colors.primary.dark,
          },
        },
        outlined: {
          borderColor: colors.border.medium,
          color: colors.text.primary,
          '&:hover': {
            borderColor: colors.border.strong,
            backgroundColor: colors.bg.raised,
          },
        },
        text: {
          color: colors.primary.main,
          '&:hover': {
            backgroundColor: colors.primary.ghost,
          },
        },
      },
    },

    // ── CARD — flat, bordered ──
    MuiCard: {
      styleOverrides: {
        root: {
          background: colors.bg.base,
          border: `1px solid ${colors.border.subtle}`,
          borderRadius: radius.md,
          boxShadow: 'none',
          transition: transitions.fast,
          '&:hover': {
            borderColor: colors.border.medium,
          },
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px',
          '&:last-child': { paddingBottom: '16px' },
        },
      },
    },

    // ── PAPER — no elevation, borders only ──
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: colors.bg.base,
          border: `1px solid ${colors.border.subtle}`,
        },
      },
    },

    // ── TEXT FIELD — light grey bg, thin borders ──
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontFamily: fonts.body,
            fontSize: fonts.size.base,
            fontVariantNumeric: 'tabular-nums',
            borderRadius: radius.md,
            backgroundColor: colors.bg.raised,
            transition: transitions.fast,
            '& fieldset': {
              borderColor: colors.border.medium,
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: colors.border.strong,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary.main,
              borderWidth: '1px',
              boxShadow: 'none',      // NO focus glow
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
            },
          },
          '& .MuiInputLabel-root': {
            fontFamily: fonts.body,
            fontSize: fonts.size.sm,
            color: colors.text.muted,
          },
        },
      },
    },

    // ── OUTLINED INPUT (standalone) ──
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.bg.raised,
          borderRadius: radius.md,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.border.medium,
            borderWidth: '1px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.border.strong,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.primary.main,
            borderWidth: '1px',
          },
          '&.Mui-focused': {
            backgroundColor: '#FFFFFF',
          },
        },
      },
    },

    // ── SELECT ──
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: fonts.body,
          fontSize: fonts.size.base,
          borderRadius: radius.md,
        },
      },
    },

    // ── TABLE CELL — Notion/Cron density ──
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: fonts.body,
          fontSize: fonts.size.base,
          fontVariantNumeric: 'tabular-nums',
          padding: '8px 12px',
          borderBottom: `1px solid ${colors.border.subtle}`,
          color: colors.text.primary,
        },
        head: {
          fontWeight: fonts.weight.medium,
          color: colors.text.secondary,
          fontSize: fonts.size.xs,
          textTransform: 'uppercase',
          letterSpacing: fonts.letterSpacing.wider,
        },
      },
    },

    // ── CHIP — small, rounded, flat ──
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: fonts.body,
          fontSize: fonts.size.xs,
          fontWeight: fonts.weight.medium,
          borderRadius: radius.sm,
          height: 22,
        },
      },
    },

    // ── TOOLTIP — clean, no heavy shadow ──
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.text.primary,
          color: '#FFFFFF',
          fontFamily: fonts.body,
          fontSize: fonts.size.xs,
          borderRadius: radius.sm,
          boxShadow: shadows.lg,
          padding: '4px 8px',
        },
      },
    },

    // ── DIALOG / MODAL — flat, bordered ──
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.bg.base,
          border: `1px solid ${colors.border.medium}`,
          borderRadius: radius.lg,
          boxShadow: shadows.xl,
        },
      },
    },

    // ── DRAWER / APP BAR — zero elevation, border edge ──
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.bg.raised,
          borderRight: `1px solid ${colors.border.medium}`,
          boxShadow: 'none',
        },
      },
    },

    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: colors.bg.base,
          borderBottom: `1px solid ${colors.border.medium}`,
          boxShadow: 'none',
          color: colors.text.primary,
        },
      },
    },

    // ── ICON BUTTON ──
    MuiIconButton: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          transition: transitions.fast,
          borderRadius: radius.md,
          '&:hover': {
            backgroundColor: colors.bg.raised,
          },
        },
      },
    },
  },
})

export default theme
