import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/shared/Logo";
import { LanguageToggle } from "@/components/shared/LanguageToggle";

export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh">
      {/* Painel esquerdo: editorial, só desktop. Gradiente real da marca. */}
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-brand p-12 text-primary-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(120% 80% at 70% 20%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(90% 70% at 20% 90%, rgba(255,255,255,0.18), transparent 60%)",
          }}
        />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-md">
          <h1 className="font-display text-display font-500 leading-tight">
            {t("app.tagline")}
          </h1>
          <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.14em] text-primary-foreground/70">
            The Global Stone Network
          </p>
        </div>
        <div className="relative text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} Stone Slab
        </div>
      </aside>

      {/* Painel direito: formulário */}
      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <div className="lg:hidden">
            <Logo />
          </div>
          <LanguageToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm animate-fade-up">{children}</div>
        </div>
      </main>
    </div>
  );
}
