import { createContext, useContext, useEffect } from "react";

type Theme = "light" | "dark";

type ThemeProviderContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderContextType>({
  theme: "dark",
  setTheme: () => null,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add("dark");
  }, []);

  return (
    <ThemeProviderContext.Provider value={{ theme: "dark", setTheme: () => null }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeProviderContext);
}
