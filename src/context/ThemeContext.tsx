import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): "light" | "dark" {
    if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("theme") as Theme) || "light";
        }
        return "light";
    });

    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
        if (theme === "system") {
            return getSystemTheme();
        }
        return theme;
    });

    // Update resolved theme when theme or system preference changes
    useEffect(() => {
        const updateResolvedTheme = () => {
            if (theme === "system") {
                setResolvedTheme(getSystemTheme());
            } else {
                setResolvedTheme(theme);
            }
        };

        updateResolvedTheme();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") {
                setResolvedTheme(getSystemTheme());
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    // Apply theme class to document
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(resolvedTheme);
    }, [resolvedTheme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
