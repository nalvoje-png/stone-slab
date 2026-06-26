import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

// Estrutura das telas autenticadas: sidebar no desktop, bottom nav no mobile.
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-2xl px-4 pb-24 pt-4 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
