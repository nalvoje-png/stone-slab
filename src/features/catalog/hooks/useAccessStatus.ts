import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getMyRequestStatus } from "../api/catalog.api";

// Status da solicitação do usuário para uma empresa.
// Usado tanto no item "Showroom" (linha de ações) quanto no
// botão "Solicitar acesso" (abaixo da legenda).
export function useAccessStatus(companyId: string) {
  const { user } = useAuth();
  const isOwn = user?.id === companyId;

  const query = useQuery({
    queryKey: ["catalog-status", companyId, user?.id],
    enabled: Boolean(user?.id) && !isOwn,
    queryFn: () => getMyRequestStatus(companyId, user!.id),
  });

  return {
    isOwn,
    isLoading: query.isLoading,
    request: query.data ?? null,
    isApproved: query.data?.status === "aprovado",
  };
}
