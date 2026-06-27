import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { CreatePostModal } from "@/features/feed/components/CreatePostModal";

// Estrutura das telas autenticadas: sidebar no desktop, bottom nav no mobile.
// O modal de publicar é controlado aqui, para o botão central da barra
// inferior poder abri-lo de qualquer tela.
export function AppShell({ children }: { children: ReactNode }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar onCreate={() => setCreateOpen(true)} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-[600px] px-0 pb-24 pt-4 sm:px-2 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>
      <BottomNav onCreate={() => setCreateOpen(true)} />
      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
