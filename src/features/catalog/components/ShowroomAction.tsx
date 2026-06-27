import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Landmark, KeyRound, Clock, X } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { requestCatalogAccess } from "../api/catalog.api";
import { useAccessStatus } from "../hooks/useAccessStatus";

// Ação de Showroom na linha de ícones do post (lado direito).
// - Aprovado  → templo romano + "Showroom" (abre o showroom)
// - Sem pedido → cadeado/chave + "Solicitar acesso"
// - Pendente / Recusado → texto discreto
// Não aparece no próprio post.
export function ShowroomAction({ companyId, originPostId }: { companyId: string; originPostId?: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isOwn, isLoading, request, isApproved } = useAccessStatus(companyId);

  const mutation = useMutation({
    mutationFn: () => requestCatalogAccess(companyId, user!.id, originPostId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog-status", companyId, user?.id] }),
  });

  if (isOwn) return null;
  if (isLoading) return <div className="h-6 w-24 animate-pulse rounded bg-secondary" />;

  // Aprovado → Showroom
  if (isApproved) {
    return (
      <button
        onClick={() => navigate(`/catalog/${companyId}`)}
        className="flex items-center gap-1.5 text-foreground transition-opacity hover:opacity-70"
        aria-label={t("catalog.showroom")}
      >
        <Landmark className="h-[24px] w-[24px]" strokeWidth={1.7} />
        <span className="text-[14px] font-medium">{t("catalog.showroom")}</span>
      </button>
    );
  }

  // Pendente / Recusado → texto discreto
  if (request) {
    const map = {
      pendente: { icon: Clock, label: t("catalog.pendingShort") },
      recusado: { icon: X, label: t("catalog.declinedShort") },
    }[request.status as "pendente" | "recusado"];
    const Icon = map.icon;
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-[22px] w-[22px]" strokeWidth={1.7} />
        <span className="text-[14px] font-medium">{map.label}</span>
      </div>
    );
  }

  // Sem pedido → Solicitar acesso
  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="flex items-center gap-1.5 text-foreground transition-opacity hover:opacity-70 disabled:opacity-50"
      aria-label={t("catalog.requestAccess")}
    >
      <KeyRound className="h-[24px] w-[24px]" strokeWidth={1.7} />
      <span className="text-[14px] font-medium">
        {mutation.isPending ? t("catalog.requesting") : t("catalog.requestAccess")}
      </span>
    </button>
  );
}
