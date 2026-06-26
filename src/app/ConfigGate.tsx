import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { LogoMark } from "@/components/shared/Logo";

// Se as variáveis do Supabase não estiverem configuradas, mostra instruções
// claras em vez de uma tela em branco.
export function ConfigGate({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured) return <>{children}</>;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface p-6">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-8 shadow-md">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <div>
            <h1 className="font-display text-h2 text-foreground">Stone Slab</h1>
            <p className="text-caption text-muted-foreground">Configuração necessária</p>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-md bg-warning-soft p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <p className="text-body text-foreground">
            As variáveis de ambiente do Supabase não foram encontradas. O app
            precisa delas para conectar ao banco.
          </p>
        </div>

        <div className="mt-6 space-y-4 text-body text-foreground">
          <p className="font-semibold">Na Vercel:</p>
          <ol className="ml-5 list-decimal space-y-2 text-muted-foreground">
            <li>Abra seu projeto → <strong>Settings</strong> → <strong>Environment Variables</strong>.</li>
            <li>
              Adicione as duas variáveis (exatamente com estes nomes):
              <div className="mt-2 space-y-1 rounded-md bg-secondary p-3 font-mono text-caption text-foreground">
                <div>VITE_SUPABASE_URL</div>
                <div>VITE_SUPABASE_ANON_KEY</div>
              </div>
            </li>
            <li>Salve e vá em <strong>Deployments</strong> → no último deploy, menu <strong>⋯</strong> → <strong>Redeploy</strong>.</li>
          </ol>
          <p className="text-caption text-muted-foreground">
            Importante: variáveis só entram em um <strong>build novo</strong>. Adicionar
            sem refazer o deploy não resolve.
          </p>
        </div>
      </div>
    </div>
  );
}
