import { supabase } from "@/lib/supabase";
import type { CatalogRequest, CatalogRequestWithProfile, RequestStatus, Profile, ShowroomTier, MyTier } from "@/types/database";

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

// ===== Portal privado (v1.1.8) =====

// Verifica, de forma segura, se o usuário tem acesso aprovado ao catálogo.
export async function checkCatalogAccess(companyId: string): Promise<boolean> {
  const { data, error } = await db.rpc("has_catalog_access", { company: companyId });
  if (error) throw error;
  return Boolean(data);
}

// Dados públicos da empresa, para o cabeçalho do portal.
export async function fetchCompanyProfile(companyId: string): Promise<Profile | null> {
  const { data, error } = await db.from("profiles").select("*").eq("id", companyId).maybeSingle();
  if (error) throw error;
  return data;
}

// Publicações da empresa, exibidas no portal privado.
export async function fetchCompanyPosts(companyId: string) {
  const { data, error } = await db
    .from("posts")
    .select(`*, media:post_media ( storage_path, position ), post_stones ( stones ( name, slug ) )`)
    .eq("author_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((p: any) => ({
    id: p.id,
    media_path: (p.media ?? []).sort(
      (a: { position: number }, b: { position: number }) => a.position - b.position
    )[0]?.storage_path ?? null,
    caption: p.caption,
    availability: p.availability,
    likes_count: p.likes_count,
    stone_name: p.post_stones?.[0]?.stones?.name ?? null,
  }));
}

// ===== Níveis do Showroom (v1.1.9) =====

// Nível e permissões do usuário atual num showroom (null se sem acesso).
export async function fetchMyTier(companyId: string): Promise<MyTier | null> {
  const { data, error } = await db.rpc("my_showroom_tier", { company: companyId });
  if (error) throw error;
  // a função retorna 0 ou 1 linha
  const row = Array.isArray(data) ? data[0] : data;
  return row ?? null;
}

// Lista os níveis de uma empresa (para a empresa gerir / escolher ao aprovar).
export async function listCompanyTiers(companyId: string): Promise<ShowroomTier[]> {
  const { data, error } = await db
    .from("showroom_tiers")
    .select("*")
    .eq("company_id", companyId)
    .order("rank", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// Define o nível de uma solicitação aprovada.
export async function setRequestTier(requestId: string, tierId: string) {
  const { error } = await db.from("catalog_requests").update({ tier_id: tierId }).eq("id", requestId);
  if (error) throw error;
}
