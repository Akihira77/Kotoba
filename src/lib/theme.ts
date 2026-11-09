import type { ThemeMode } from "./types";

export const THEME_STORAGE_KEY = "kotoba.theme";

export function resolveDark(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function readStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") return value;
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * The server profile defaults to "system". A local explicit choice (from the
 * boot script or the settings page) should win over that default so the first
 * paint does not flash the opposite theme.
 */
export function preferredTheme(serverTheme: ThemeMode): ThemeMode {
  if (serverTheme !== "system") return serverTheme;
  const stored = readStoredTheme();
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  const dark = resolveDark(mode);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export const themeBootScript = `(function(){try{var m=localStorage.getItem("kotoba.theme")||"system";var d=m==="dark"||(m!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
