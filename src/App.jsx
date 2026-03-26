import { Outlet } from "react-router-dom";
import { AppShell } from "./components/app-shell";
import { useThemeSync } from "./hooks/use-theme-sync";
import { useAppStore } from "./store/app-store";

export default function App() {
  const theme = useAppStore((state) => state.theme);

  useThemeSync(theme);

  return (
    <AppShell>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </AppShell>
  );
}
