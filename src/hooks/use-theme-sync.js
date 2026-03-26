import { useEffect } from "react";

export function useThemeSync(theme) {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark);
    body.classList.toggle("bg-slate-950", isDark);
    body.classList.toggle("bg-slate-50", !isDark);
    body.classList.toggle("text-slate-100", isDark);
    body.classList.toggle("text-slate-950", !isDark);
  }, [theme]);
}
