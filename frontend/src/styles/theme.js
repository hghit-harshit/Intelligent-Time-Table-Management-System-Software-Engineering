/**
 * theme.js — MUI Theme Configuration
 * 
 * PURPOSE: Creates a Material UI theme that maps our design tokens
 * into MUI's theming system. This ensures every MUI component
 * (Button, TextField, Card, etc.) automatically uses our design system.
 * 
 * HOW IT WORKS: MUI's createTheme() lets us override default colors,
 * typography, and even how individual components look. We import our
 * tokens and wire them into MUI's expected structure.
 */

import { createTheme } from '@mui/material/styles'
import { colors, fonts, radius, shadows, transitions } from './tokens'

const theme = createTheme({
  // ─── PALETTE ─────────────────────────────────────────────────
  // Maps our color tokens to MUI's palette system so components
  // like <Button color="primary"> automatically use our teal
  palette: {
    mode: 'dark',
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
    divider: colors.border.subtle,
  },

  // ─── TYPOGRAPHY ──────────────────────────────────────────────
  // Sets our custom fonts globally. MUI components like <Typography>
  // will automatically use these fonts and sizes.
  typography: {
    fontFamily: fonts.body,

    // Display — large hero text (login page title)
    h1: {
      fontFamily: fonts.heading,
      fontSize:   fonts.size['3xl'],
      fontWeight: fonts.weight.bold,
      lineHeight: 1.1,
      letterSpacing: fonts.letterSpacing.tight,
      color: colors.text.primary,
    },

    // Page title (e.g., "My Timetable", "Admin Dashboard")
    h2: {
      fontFamily: fonts.heading,
      fontSize:   fonts.size['2xl'],
      fontWeight: fonts.weight.bold,
      lineHeight: 1.2,
      color: colors.text.primary,
    },

    // Section heading (e.g., "Time Slots Configuration")
    h3: {
      fontFamily: fonts.heading,
      fontSize:   fonts.size.xl,
      fontWeight: fonts.weight.bold,
      lineHeight: 1.3,
      color: colors.text.primary,
    },

    // Card title
    h4: {
      fontFamily: fonts.heading,
      fontSize:   fonts.size.lg,
      fontWeight: fonts.weight.bold,
      lineHeight: 1.4,
      color: colors.text.primary,
    },

    // Subheading
    h5: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.md,
      fontWeight: fonts.weight.bold,
      letterSpacing: fonts.letterSpacing.wide,
      textTransform: 'uppercase',
      color: colors.text.secondary,
    },

    // Label text
    h6: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.sm,
      fontWeight: fonts.weight.medium,
      letterSpacing: fonts.letterSpacing.wider,
      textTransform: 'uppercase',
      color: colors.text.muted,
    },

    // Body text — primary
    body1: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.base,
      fontWeight: fonts.weight.regular,
      lineHeight: 1.6,
      color: colors.text.secondary,
    },

    // Body text — secondary (smaller)
    body2: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.sm,
      fontWeight: fonts.weight.regular,
      lineHeight: 1.5,
      color: colors.text.muted,
    },

    // Caption — smallest text
    caption: {
      fontFamily: fonts.body,
      fontSize:   fonts.size.xs,
      fontWeight: fonts.weight.regular,
      letterSpacing: fonts.letterSpacing.wide,
      color: colors.text.muted,
    },

    // Button text
    button: {
      fontFamily:    fonts.body,
      fontSize:      fonts.size.sm,
      fontWeight:    fonts.weight.bold,
      letterSpacing: fonts.letterSpacing.wider,
      textTransform: 'uppercase',
    },
  },

  // ─── SHAPE ───────────────────────────────────────────────────
  shape: {
    borderRadius: parseInt(radius.md),
  },

  // ─── COMPONENT OVERRIDES ─────────────────────────────────────
  // Customizes how individual MUI components render by default.
  // This avoids repeating sx props everywhere.
  components: {

    // Global CSS baseline — sets body background, font
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.bg.deep,
          color: colors.text.primary,
          fontFamily: fonts.body,
          // Custom scrollbar for the dark theme
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: colors.bg.deep,
          },
          '&::-webkit-scrollbar-thumb': {
            background: colors.border.medium,
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: colors.border.strong,
          },
        },
      },
    },

    // BUTTON — our primary interactive element
    MuiButton: {
      defaultProps: {
        disableElevation: true, // flat design, no material shadows
      },
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          padding: '10px 20px',
          transition: transitions.normal,
          fontFamily: fonts.body,
          fontSize: fonts.size.sm,
          fontWeight: fonts.weight.bold,
          letterSpacing: fonts.letterSpacing.wider,
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0) scale(0.98)',
          },
        },
        // Filled button — primary teal
        contained: {
          background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.dark})`,
          color: colors.bg.deep,
          boxShadow: `0 4px 16px ${colors.primary.glow}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primary.light}, ${colors.primary.main})`,
            boxShadow: `0 8px 24px ${colors.primary.glow}`,
          },
        },
        // Outlined button
        outlined: {
          borderColor: colors.border.medium,
          color: colors.text.primary,
          '&:hover': {
            borderColor: colors.primary.border,
            background: colors.primary.ghost,
          },
        },
        // Text/ghost button
        text: {
          color: colors.primary.main,
          '&:hover': {
            background: colors.primary.ghost,
          },
        },
      },
    },

    // CARD — glass morphism cards
    MuiCard: {
      styleOverrides: {
        root: {
          background: colors.bg.base,
          border: `1px solid ${colors.border.subtle}`,
          borderRadius: radius.xl,
          boxShadow: shadows.sm,
          transition: transitions.normal,
          '&:hover': {
            borderColor: colors.border.medium,
            boxShadow: shadows.md,
          },
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',
          '&:last-child': {
            paddingBottom: '20px',
          },
        },
      },
    },

    // PAPER — base surface component
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // removes MUI's default gradient
          backgroundColor: colors.bg.base,
        },
      },
    },

    // TEXT FIELD — form inputs
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontFamily: fonts.body,
            fontSize: fonts.size.base,
            borderRadius: radius.md,
            backgroundColor: colors.bg.raised,
            transition: transitions.normal,
            '& fieldset': {
              borderColor: colors.border.medium,
            },
            '&:hover fieldset': {
              borderColor: colors.border.strong,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary.main,
              borderWidth: '1px',
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

    // SELECT — dropdown
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: fonts.body,
          fontSize: fonts.size.base,
          borderRadius: radius.md,
        },
      },
    },

    // CHIP — badges and tags
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: fonts.body,
          fontSize: fonts.size.xs,
          fontWeight: fonts.weight.bold,
          letterSpacing: fonts.letterSpacing.wide,
          borderRadius: radius.full,
        },
      },
    },

    // TOOLTIP
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.bg.overlay,
          border: `1px solid ${colors.border.medium}`,
          fontFamily: fonts.body,
          fontSize: fonts.size.xs,
          borderRadius: radius.sm,
          boxShadow: shadows.md,
        },
      },
    },

    // DIALOG / MODAL
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.bg.raised,
          border: `1px solid ${colors.border.medium}`,
          borderRadius: radius.xl,
          boxShadow: shadows.xl,
        },
      },
    },

    // ICON BUTTON
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: transitions.normal,
          '&:hover': {
            background: colors.primary.ghost,
          },
        },
      },
    },
  },
})

export default theme
