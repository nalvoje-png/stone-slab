import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  fetchIncomingRequests,
  fetchOutgoingRequests,
  decideRequest,
  cancelRequest,
} from "../api/catalog.api";

export function useIncomingRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["incoming-requests", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => fetchIncomingRequests(user!.id),
  });
}

export function useOutgoingRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["outgoing-requests", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => fetchOutgoingRequests(user!.id),
  });
}

export function useDecideRequest() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "aprovado" | "recusado" }) =>
      decideRequest(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incoming-requests", user?.id] }),
  });
}

export function useCancelRequest() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outgoing-requests", user?.id] }),
  });
}
