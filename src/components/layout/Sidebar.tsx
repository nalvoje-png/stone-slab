import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Compass, PlusSquare, Gem, Bell, User, Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { APP_VERSION } from "@/lib/version";

// Sidebar — exclusivo do desktop. Navegação vertical, rótulos sempre visíveis.
// "Publicar" é um botão (abre modal), não um link de rota.

export function Sidebar({ onCreate }: { onCreate?: () => void }) {
  const { t } = useTranslation();
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-background px-4 py-6 lg:flex">
      <div className="px-3">
        <Logo />
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        <NavLink to="/" end className={navClass}>
          {({ isActive }) => <Row icon={Home} label={t("nav.feed")} active={isActive} />}
        </NavLink>
        <NavLink to="/explore" className={navClass}>
          {({ isActive }) => <Row icon={Compass} label={t("nav.explore")} active={isActive} />}
        </NavLink>

        {/* Publicar — botão, abre o modal */}
        <button onClick={onCreate} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium text-foreground transition-colors hover:bg-secondary">
          <PlusSquare className="h-5 w-5" strokeWidth={2} />
          {t("nav.create")}
        </button>

        <NavLink to="/stones" className={navClass}>
          {({ isActive }) => <Row icon={Gem} label={t("nav.stones")} active={isActive} />}
        </NavLink>
        <NavLink to="/requests" className={navClass}>
          {({ isActive }) => <Row icon={Inbox} label={t("nav.requests")} active={isActive} />}
        </NavLink>
        <NavLink to="/notifications" className={navClass}>
          {({ isActive }) => <Row icon={Bell} label={t("nav.notifications")} active={isActive} />}
        </NavLink>
        <NavLink to="/profile" className={navClass}>
          {({ isActive }) => <Row icon={User} label={t("nav.profile")} active={isActive} />}
        </NavLink>
      </nav>

      <div className="mt-auto px-3 pt-4 text-caption text-muted-foreground">v{APP_VERSION}</div>
    </aside>
  );
}

function navClass() {
  return "rounded-md";
}

function Row({ icon: Icon, label, active }: { icon: LucideIcon; label: string; active: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium transition-colors",
        active ? "bg-primary-soft text-primary" : "text-foreground hover:bg-secondary"
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.3 : 2} />
      {label}
    </span>
  );
}
