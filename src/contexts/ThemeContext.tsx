"use client";

import { useEffect, ReactNode } from "react";
import { useSettings } from "./SettingsContext";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Cleanup previous classes
    root.classList.remove("light", "dark");
    
    if (settings.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      if (systemTheme === "dark") {
        root.classList.add("dark");
      }
      
      const listener = (e: MediaQueryListEvent) => {
        root.classList.remove("light", "dark");
        if (e.matches) {
          root.classList.add("dark");
        }
      };
      
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
      
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  // Optionally listen to localStorage changes if multiple tabs are open
  // But here settings context updates firestore and local state.

  return <>{children}</>;
}
