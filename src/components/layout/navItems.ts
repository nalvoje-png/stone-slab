import { Home, Compass, PlusSquare, Gem, Bell, User, type LucideIcon } from "lucide-react";

export interface NavItem {
  key: string;
  to: string;
  icon: LucideIcon;
}

// Itens centrais da navegação. Bottom nav (mobile) usa os 5 primeiros;
// sidebar (desktop) usa todos.
export const NAV_ITEMS: NavItem[] = [
  { key: "feed", to: "/", icon: Home },
  { key: "explore", to: "/explore", icon: Compass },
  { key: "create", to: "/create", icon: PlusSquare },
  { key: "stones", to: "/stones", icon: Gem },
  { key: "notifications", to: "/notifications", icon: Bell },
  { key: "profile", to: "/profile", icon: User },
];
