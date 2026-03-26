import { MoonStar, SunMedium } from "lucide-react";
import { useAppStore } from "../store/app-store";

export function AppShell({ children }) {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:overflow-hidden">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
            Snapshot
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900 transition-colors dark:text-white sm:text-2xl">
            Voting Console
          </h1>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {theme === "light" ? <MoonStar size={16} /> : <SunMedium size={16} />}
          {theme === "light" ? "Dark" : "Light"}
        </button>
      </div>
      <div className="flex-1 lg:min-h-0">{children}</div>
    </div>
  );
}
