import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Lock, Clock, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getMyRequestStatus, requestCatalogAccess } from "../api/catalog.api";

interface CatalogAccessButtonProps {
  companyId: string;
  originPostId?: string;
}

// Botão discreto "Solicitar acesso ao catálogo".
// Não aparece nos próprios posts. Reflete o estado da solicitação.
export function CatalogAccessButton({ companyId, originPostId }: CatalogAccessButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();

  // Não mostra no próprio conteúdo
  if (user?.id === companyId) return null;

  const key = ["catalog-status", companyId, user?.id];

  const { data: request, isLoading } = useQuery({
    queryKey: key,
    enabled: Boolean(user?.id),
    queryFn: () => getMyRequestStatus(companyId, user!.id),
  });

  const mutation = useMutation({
    mutationFn: () => requestCatalogAccess(companyId, user!.id, originPostId),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  if (isLoading) {
    return <div className="h-9 w-full animate-pulse rounded-xl bg-secondary" />;
  }

  // Já existe solicitação — mostra o estado
  if (request) {
    const map = {
      pendente: { icon: Clock, label: t("catalog.pending"), cls: "bg-secondary text-muted-foreground" },
      aprovado: { icon: Check, label: t("catalog.approved"), cls: "bg-success-soft text-success" },
      recusado: { icon: X, label: t("catalog.declined"), cls: "bg-destructive-soft text-destructive" },
    }[request.status];
    const Icon = map.icon;
    return (
      <div className={cn("flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-medium", map.cls)}>
        <Icon className="h-4 w-4" />
        {map.label}
      </div>
    );
  }

  // Ainda não solicitou
  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary-soft text-[14px] font-medium text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
    >
      <Lock className="h-4 w-4" />
      {mutation.isPending ? t("catalog.requesting") : t("catalog.requestAccess")}
    </button>
  );
}
