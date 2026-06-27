import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Lock, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { requestCatalogAccess } from "../api/catalog.api";
import { useAccessStatus } from "../hooks/useAccessStatus";

interface CatalogAccessButtonProps {
  companyId: string;
  originPostId?: string;
}

// Botão "Solicitar acesso" abaixo da legenda.
// NÃO mostra nada quando já é parceiro aprovado — nesse caso, o acesso
// ao Showroom fica na linha de ações (ver ShowroomAction).
export function CatalogAccessButton({ companyId, originPostId }: CatalogAccessButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { isOwn, isLoading, request, isApproved } = useAccessStatus(companyId);

  const mutation = useMutation({
    mutationFn: () => requestCatalogAccess(companyId, user!.id, originPostId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog-status", companyId, user?.id] }),
  });

  // Não mostra no próprio post nem quando já é parceiro aprovado
  if (isOwn || isApproved) return null;

  if (isLoading) {
    return <div className="h-10 w-full animate-pulse rounded-xl bg-secondary" />;
  }

  // Pendente ou recusado — estado informativo
  if (request) {
    const map = {
      pendente: { icon: Clock, label: t("catalog.pending"), cls: "bg-secondary text-muted-foreground" },
      recusado: { icon: X, label: t("catalog.declined"), cls: "bg-destructive-soft text-destructive" },
    }[request.status as "pendente" | "recusado"];
    const Icon = map.icon;
    return (
      <div className={cn("flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-medium", map.cls)}>
        <Icon className="h-4 w-4" />
        {map.label}
      </div>
    );
  }

  // Não solicitou ainda
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
