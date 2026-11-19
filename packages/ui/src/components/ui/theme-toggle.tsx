"use client";

import { Moon, Sun } from "lucide-react";
import * as React from "react";
import { cn } from "cn";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "truehook_theme";

export function ThemeScript() {
  const scriptContent = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var theme=t==="dark"||t==="light"?t:(d?"dark":"light");if(theme==="dark"){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})()`;
  return <script dangerouslySetInnerHTML={{ __html: scriptContent }} />;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const isDark = document.documentElement.classList.contains("dark");
      setThemeState(isDark ? "dark" : "light");
    } catch {
      // DOM access not available
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
        applyTheme(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const applyTheme = React.useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    try {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem(STORAGE_KEY, nextTheme);
      document.cookie = `${STORAGE_KEY}=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Storage access failed
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark");
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: applyTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export interface ThemeToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  showLabel?: boolean;
}

export function ThemeToggle({
  className,
  showLabel = false,
  ...props
}: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        aria-hidden="true"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-canvas text-muted-foreground opacity-60 shadow-2xs",
          className
        )}
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-sound="click"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-canvas p-2 text-foreground shadow-2xs transition-all duration-200 hover:bg-secondary2 hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
        showLabel ? "h-9 px-3 text-xs font-medium" : "h-9 w-9",
        className
      )}
      {...props}
    >
      {isDark ? (
        <Sun className="h-4 w-4 shrink-0 transition-transform duration-200 hover:rotate-45 text-foreground" />
      ) : (
        <Moon className="h-4 w-4 shrink-0 transition-transform duration-200 hover:-rotate-12 text-foreground" />
      )}
      {showLabel && (
        <span className="truncate">{isDark ? "Light mode" : "Dark mode"}</span>
      )}
    </button>
  );
}
