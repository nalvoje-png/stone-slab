import { supabase } from "@/lib/supabase";
import type { CatalogRequest, CatalogRequestWithProfile, RequestStatus } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const PROFILE_FIELDS =
  "id, display_name, username, avatar_url, company_name, account_type, country_code, is_verified";

// Status da solicitação do usuário atual para uma empresa (ou null se nunca pediu).
export async function getMyRequestStatus(
  companyId: string,
  userId: string
): Promise<CatalogRequest | null> {
  const { data, error } = await db
    .from("catalog_requests")
    .select("*")
    .eq("requester_id", userId)
    .eq("company_id", companyId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Cria uma solicitação de acesso ao catálogo de uma empresa.
export async function requestCatalogAccess(
  companyId: string,
  userId: string,
  originPostId?: string,
  message?: string
): Promise<CatalogRequest> {
  const { data, error } = await db
    .from("catalog_requests")
    .insert({
      requester_id: userId,
      company_id: companyId,
      origin_post_id: originPostId ?? null,
      message: message ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Cancela (apaga) a própria solicitação.
export async function cancelRequest(requestId: string) {
  const { error } = await db.from("catalog_requests").delete().eq("id", requestId);
  if (error) throw error;
}

// Lado EMPRESA: lista as solicitações recebidas, com dados do comprador.
export async function fetchIncomingRequests(
  companyId: string,
  status?: RequestStatus
): Promise<CatalogRequestWithProfile[]> {
  let q = db
    .from("catalog_requests")
    .select(`*, requester:profiles!catalog_requests_requester_id_fkey (${PROFILE_FIELDS})`)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// Lado COMPRADOR: lista as solicitações feitas, com dados da empresa.
export async function fetchOutgoingRequests(
  userId: string
): Promise<CatalogRequestWithProfile[]> {
  const { data, error } = await db
    .from("catalog_requests")
    .select(`*, company:profiles!catalog_requests_company_id_fkey (${PROFILE_FIELDS})`)
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Empresa decide: aprovar ou recusar.
export async function decideRequest(requestId: string, status: "aprovado" | "recusado") {
  const { error } = await db
    .from("catalog_requests")
    .update({ status })
    .eq("id", requestId);
  if (error) throw error;
}
