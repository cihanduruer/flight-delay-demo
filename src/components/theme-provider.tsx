"use client";

import * as React from "react";

const COOKIE_NAME = "theme";
const DARK = "dark";
const LIGHT = "light";

type Theme = typeof DARK | typeof LIGHT;

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: LIGHT,
  toggle: () => {},
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

function readCookie(): Theme {
  if (typeof document === "undefined") return LIGHT;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  const value = match?.split("=")[1];
  return value === DARK ? DARK : LIGHT;
}

function writeCookie(theme: Theme) {
  const maxAgeSeconds = 365 * 24 * 60 * 60; // 1 year
  document.cookie = `${COOKIE_NAME}=${theme};path=/;max-age=${maxAgeSeconds};SameSite=Lax`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(LIGHT);

  // Read cookie on mount and apply class
  React.useEffect(() => {
    const saved = readCookie();
    setTheme(saved);
    document.documentElement.classList.toggle(DARK, saved === DARK);
  }, []);

  const toggle = React.useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === DARK ? LIGHT : DARK;
      writeCookie(next);
      document.documentElement.classList.toggle(DARK, next === DARK);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
