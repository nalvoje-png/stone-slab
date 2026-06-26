import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { NAV_ITEMS } from "./navItems";
import { APP_VERSION } from "@/lib/version";

// Sidebar — exclusivo do desktop. Navegação vertical, rótulos sempre visíveis.
export function Sidebar() {
  const { t } = useTranslation();
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-background px-4 py-6 lg:flex">
      <div className="px-3">
        <Logo />
      </div>
      <nav className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map(({ key, to, icon: Icon }) => (
          <NavLink
            key={key}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium transition-colors",
                isActive
                  ? "bg-primary-soft text-primary"
                  : "text-foreground hover:bg-surface"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                {t(`nav.${key}`)}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-3 pt-4 text-caption text-muted-foreground">
        v{APP_VERSION}
      </div>
    </aside>
  );
}
