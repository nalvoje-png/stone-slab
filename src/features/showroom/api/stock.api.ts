import { supabase } from "@/lib/supabase";
import type { ShowroomMaterial, ShowroomBundle, ShowroomSlab } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ===== MATERIAIS =====
export async function listMaterials(companyId: string): Promise<ShowroomMaterial[]> {
  const { data, error } = await db
    .from("showroom_materials")
    .select("*")
    .eq("company_id", companyId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createMaterial(
  companyId: string,
  name: string,
  coverPath?: string,
  description?: string
): Promise<ShowroomMaterial> {
  const { data, error } = await db
    .from("showroom_materials")
    .insert({ company_id: companyId, name, cover_path: coverPath ?? null, description: description ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMaterial(id: string) {
  const { error } = await db.from("showroom_materials").delete().eq("id", id);
  if (error) throw error;
}

// ===== BUNDLES =====
export async function listBundles(materialId: string): Promise<ShowroomBundle[]> {
  const { data, error } = await db
    .from("showroom_bundles")
    .select("*")
    .eq("material_id", materialId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface NewBundleInput {
  company_id: string;
  material_id: string;
  bundle_number: string;
  thickness?: string;
  finish?: string;
  price_sqm?: number;
  price_sqft?: number;
}

export async function createBundle(input: NewBundleInput): Promise<ShowroomBundle> {
  const { data, error } = await db.from("showroom_bundles").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBundle(id: string) {
  const { error } = await db.from("showroom_bundles").delete().eq("id", id);
  if (error) throw error;
}

// ===== CHAPAS =====
export async function listSlabs(bundleId: string): Promise<ShowroomSlab[]> {
  const { data, error } = await db
    .from("showroom_slabs")
    .select("*")
    .eq("bundle_id", bundleId)
    .order("code");
  if (error) throw error;
  return data ?? [];
}

export interface NewSlabInput {
  company_id: string;
  bundle_id: string;
  code: string;
  photo_path?: string;
  length_m?: number;
  height_m?: number;
}

export async function createSlab(input: NewSlabInput): Promise<ShowroomSlab> {
  const { data, error } = await db.from("showroom_slabs").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSlab(id: string) {
  const { error } = await db.from("showroom_slabs").delete().eq("id", id);
  if (error) throw error;
}

// ===== UPLOAD de fotos (bucket showroom-media) =====
export async function uploadShowroomPhoto(file: File, companyId: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${companyId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await db.storage.from("showroom-media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export function showroomMediaUrl(path: string | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return db.storage.from("showroom-media").getPublicUrl(path).data.publicUrl;
}

// ===== LEITURA pelo comprador aprovado (Fatia 2) =====
// As policies de RLS já garantem que só aprovados leem. Estas funções
// são por empresa (companyId), para a navegação no Showroom.

export async function browseMaterials(companyId: string): Promise<ShowroomMaterial[]> {
  const { data, error } = await db
    .from("showroom_materials")
    .select("*")
    .eq("company_id", companyId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function browseBundles(materialId: string): Promise<ShowroomBundle[]> {
  const { data, error } = await db
    .from("showroom_bundles")
    .select("*")
    .eq("material_id", materialId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function browseSlabs(bundleId: string): Promise<ShowroomSlab[]> {
  const { data, error } = await db
    .from("showroom_slabs")
    .select("*")
    .eq("bundle_id", bundleId)
    .order("code");
  if (error) throw error;
  return data ?? [];
}

export async function getMaterial(materialId: string): Promise<ShowroomMaterial | null> {
  const { data, error } = await db.from("showroom_materials").select("*").eq("id", materialId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getBundle(bundleId: string): Promise<ShowroomBundle | null> {
  const { data, error } = await db.from("showroom_bundles").select("*").eq("id", bundleId).maybeSingle();
  if (error) throw error;
  return data;
}
