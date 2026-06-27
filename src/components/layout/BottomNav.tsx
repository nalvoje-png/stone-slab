import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Compass, Gem, Bell, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Bottom Navigation premium — 4 destinos + botão central circular de publicar.
const ITEMS = [
  { key: "feed", to: "/", icon: Home },
  { key: "explore", to: "/explore", icon: Compass },
  { key: "stones", to: "/stones", icon: Gem },
  { key: "notifications", to: "/notifications", icon: Bell },
];

export function BottomNav({ onCreate }: { onCreate?: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  function handleCreate() {
    if (onCreate) onCreate();
    else navigate("/?create=1");
  }

  // dois itens à esquerda, FAB no centro, dois à direita
  const left = ITEMS.slice(0, 2);
  const right = ITEMS.slice(2);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {left.map((item) => (
          <NavItem key={item.key} item={item} label={t(`nav.${item.key}`)} />
        ))}

        <button
          onClick={handleCreate}
          className="-mt-6 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition-transform active:scale-90"
          aria-label={t("nav.create")}
        >
          <Plus className="h-7 w-7" strokeWidth={2.4} />
        </button>

        {right.map((item) => (
          <NavItem key={item.key} item={item} label={t(`nav.${item.key}`)} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  item,
  label,
}: {
  item: { to: string; icon: typeof Home };
  label: string;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) =>
        cn(
          "flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="h-[25px] w-[25px]" strokeWidth={isActive ? 2.3 : 2} />
          <span className="text-[10px] font-medium">{label}</span>
        </>
      )}
    </NavLink>
  );
}
