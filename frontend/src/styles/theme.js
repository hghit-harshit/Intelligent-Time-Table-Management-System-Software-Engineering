/**
 * theme.js — MUI Theme Configuration
 *
 * PURPOSE: Maps design tokens into MUI's theming system.
 * Every MUI component inherits this visual language automatically.
 *
 * AESTHETIC: Clean Notion-inspired light theme with DM Sans typeface
 * and deep slate (#1E3A5F) accent color. Subtle shadows replace
 * flat borders for key interactive elements.
 *
 * BRAND: Smart Timetable (DISHA)
 */

import { createTheme } from '@mui/material/styles'
import { colors, fonts, radius, shadows, transitions } from './tokens'

const theme = createTheme({
  // ─── PALETTE ─────────────────────────────────────────────────
  palette: {
    mode: 'light',
    primary: {
      main:  colors.primary.main,   // #1E3A5F — deep slate blue
      light: colors.primary.light,
      dark:  colors.primary.dark,
    },
    secondary: {
      main:  colors.secondary.main,
      light: colors.secondary.light,
    },
    warning: { main: colors.warning.main, light: colors.warning.light },
    error:   { main: colors.error.main,   light: colors.error.light },
    success: { main: colors.success.main, light: colors.success.light },
    background: {
      default: colors.bg.deep,     // #FAFAFA — warm off-white canvas
      paper:   colors.bg.base,     // #FFFFFF — cards
    },
    text: {
      primary:   colors.text.primary,    // #111827 — dark ink
      secondary: colors.text.secondary,  // #4B5563 — body
      disabled:  colors.text.disabled,
    },
    divider: colors.border.medium,
  },

  // ─── TYPOGRAPHY ──────────────────────────────────────────────
  // DM Sans: geometric warmth, excellent at small sizes
  typography: {
    fontFamily: fonts.body,
    fontVariantNumeric: 'tabular-nums',

    h1: {
      fontFamily: fonts.heading,
      fontSize:   fonts.size['3xl'],   // 28px — hero text
      fontWeight: fonts.weight.bold,   // 700 for commanding presence
      lineHeight: 1.2,
      letterSpacing: fonts.letterSpacing.tight,
      color: colors.text.primary,
    },
    h2: {
      fontFamily: fonts.heading,
      fontSize:   fonts.size['2xl'],   // 24px — page titles
      fontWeight: fonts.weight.bold,
      lineHeight: 1.25,
      letterSpacing: fonts.letterSpacing.tight,
      color: colors.text.primary,
    },
    h3: {
      fontFamily: fonts.heading,
      fontSize:   fonts.size.xl,       // 20px — section headings
      fontWeight: fonts.weight.semibold,
      lineHeight: 1.3,
      color: colors.text.primary,
    },
    h4: {
      fontFamily: fonts.heading,
      fontSize:   fonts.size.lg,       // 16px — card headings
      fontWeight: fonts.weight.semibold,
      lineHeight: 1.4,
      color: colors.text.primary,
    },
    h5: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.md,       // 14px — sub-labels
      fontWeight: fonts.weight.medium,
      letterSpacing: fonts.letterSpacing.wide,
      color: colors.text.secondary,
    },
    h6: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.sm,
      fontWeight: fonts.weight.medium,
      letterSpacing: fonts.letterSpacing.wider,
      textTransform: 'uppercase',      // section category labels
      color: colors.text.muted,
    },
    body1: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.base,     // 13px
      fontWeight: fonts.weight.regular,
      lineHeight: 1.6,
      color: colors.text.primary,
    },
    body2: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.sm,       // 12px
      fontWeight: fonts.weight.regular,
      lineHeight: 1.5,
      color: colors.text.secondary,
    },
    caption: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.xs,       // 11px
      fontWeight: fonts.weight.regular,
      letterSpacing: fonts.letterSpacing.wide,
      color: colors.text.muted,
    },
    button: {
      fontFamily:    fonts.body,
      fontSize:      fonts.size.sm,
      fontWeight:    fonts.weight.medium,
      letterSpacing: fonts.letterSpacing.normal,
      textTransform: 'none',           // no uppercase buttons
    },
  },

  // ─── SHAPE ───────────────────────────────────────────────────
  shape: {
    borderRadius: parseInt(radius.md),  // 8px default
  },

  // ─── COMPONENT OVERRIDES ─────────────────────────────────────
  components: {

    // ── Global baseline ──
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.bg.deep,
          color: colors.text.primary,
          fontFamily: fonts.body,
          fontVariantNumeric: 'tabular-nums',
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
        },
      },
    },

    // ── BUTTON ──
    // Solid fill for primary, ghost/outline for secondary
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          padding: '6px 16px',
          transition: transitions.fast,
          fontFamily: fonts.body,
          fontSize: fonts.size.sm,
          fontWeight: fonts.weight.medium,
          textTransform: 'none',
          minHeight: 34,
          boxShadow: 'none',
          '&:hover':  { boxShadow: 'none' },
          '&:active': { transform: 'scale(0.98)' },
        },
        contained: {
          backgroundColor: colors.primary.main,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: colors.primary.light,
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

    // ── CARD ──
    MuiCard: {
      styleOverrides: {
        root: {
          background: colors.bg.base,
          border: `1px solid ${colors.border.medium}`,
          borderRadius: radius.lg,
          boxShadow: shadows.sm,       // very subtle shadow for depth
          transition: transitions.fast,
          '&:hover': {
            boxShadow: shadows.md,
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

    // ── PAPER ──
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

    // ── TEXT FIELD ──
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontFamily: fonts.body,
            fontSize: fonts.size.base,
            fontVariantNumeric: 'tabular-nums',
            borderRadius: radius.md,
            backgroundColor: colors.bg.base,
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
              borderWidth: '1.5px',
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

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.bg.base,
          borderRadius: radius.md,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.border.medium,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.border.strong,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.primary.main,
            borderWidth: '1.5px',
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: fonts.body,
          fontSize: fonts.size.base,
          borderRadius: radius.md,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: fonts.body,
          fontSize: fonts.size.base,
          fontVariantNumeric: 'tabular-nums',
          padding: '10px 14px',
          borderBottom: `1px solid ${colors.border.subtle}`,
          color: colors.text.primary,
        },
        head: {
          fontWeight: fonts.weight.semibold,
          color: colors.text.secondary,
          fontSize: fonts.size.xs,
          textTransform: 'uppercase',
          letterSpacing: fonts.letterSpacing.wider,
        },
      },
    },

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

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.text.primary,
          color: '#FFFFFF',
          fontFamily: fonts.body,
          fontSize: fonts.size.xs,
          borderRadius: radius.sm,
          boxShadow: shadows.lg,
          padding: '6px 10px',
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.bg.base,
          border: `1px solid ${colors.border.medium}`,
          borderRadius: radius.xl,
          boxShadow: shadows.xl,
        },
      },
    },

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

    MuiIconButton: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          transition: transitions.fast,
          borderRadius: radius.md,
          '&:hover': {
            backgroundColor: colors.secondary.ghost,
          },
        },
      },
    },
  },
})

export default theme
