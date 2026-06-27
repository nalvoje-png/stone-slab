import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { listCompanyTiers, setRequestTier } from "../api/catalog.api";
import { cn } from "@/lib/utils";

// Seletor de nível para uma solicitação aprovada (lado empresa).
export function TierSelector({ requestId, currentTierId }: { requestId: string; currentTierId: string | null }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: tiers = [] } = useQuery({
    queryKey: ["company-tiers", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => listCompanyTiers(user!.id),
  });

  const mutation = useMutation({
    mutationFn: (tierId: string) => setRequestTier(requestId, tierId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incoming-requests", user?.id] }),
  });

  if (tiers.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="mb-1.5 text-caption text-muted-foreground">{t("catalog.tier")}</div>
      <div className="flex flex-wrap gap-1.5">
        {tiers.map((tier) => {
          const active = tier.id === currentTierId;
          return (
            <button
              key={tier.id}
              onClick={() => mutation.mutate(tier.id)}
              disabled={mutation.isPending}
              className={cn(
                "h-8 rounded-full border px-3 text-caption font-medium transition-all disabled:opacity-50",
                active
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border text-foreground hover:bg-secondary"
              )}
            >
              {tier.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
