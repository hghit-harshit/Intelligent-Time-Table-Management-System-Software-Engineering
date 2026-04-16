import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type Mode = "light" | "dark";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563eb", light: "#3b82f6", dark: "#1d4ed8" },
    secondary: { main: "#6366f1", light: "#818cf8" },
    background: { default: "#fafafa", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#475569" },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 8, padding: "8px 16px" },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3b82f6", light: "#60a5fa", dark: "#2563eb" },
    secondary: { main: "#818cf8", light: "#a5b4fc" },
    background: { default: "#09090b", paper: "#18181b" },
    text: { primary: "#fafafa", secondary: "#a1a1aa" },
    divider: "#27272a",
  },
  typography: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 8, padding: "8px 16px" },
      },
    },
  },
});

interface ThemeContextType {
  mode: Mode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ mode: "light", toggleTheme: () => {} });

export const useThemeMode = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem("theme_mode");
    return (saved as Mode) || "light";
  });

  useEffect(() => {
    localStorage.setItem("theme_mode", mode);
  }, [mode]);

  const toggleTheme = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = mode === "light" ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}