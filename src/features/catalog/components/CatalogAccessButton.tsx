import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, Clock, X, BadgeCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getMyRequestStatus, requestCatalogAccess } from "../api/catalog.api";

interface CatalogAccessButtonProps {
  companyId: string;
  originPostId?: string;
}

// Botão discreto da ponte comercial. Reflete o estado da solicitação.
// Aprovado: vira "Ver catálogo" + selo "Parceiro de negócio".
export function CatalogAccessButton({ companyId, originPostId }: CatalogAccessButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

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
    return <div className="h-10 w-full animate-pulse rounded-xl bg-secondary" />;
  }

  // APROVADO — parceiro de negócio: selo + botão de acesso ao portal
  if (request?.status === "aprovado") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-success">
          <BadgeCheck className="h-4 w-4" />
          {t("catalog.partner")}
        </div>
        <button
          onClick={() => navigate(`/catalog/${companyId}`)}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("catalog.viewCatalog")}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // PENDENTE ou RECUSADO — estado informativo
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

  // NÃO SOLICITOU
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
