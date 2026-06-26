import { supabase } from "@/lib/supabase";
import type { Stone } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const EXPLORE_PAGE = 18;

export interface ExploreItem {
  post_id: string;
  media_path: string;
  likes_count: number;
  availability: string;
  stone_name: string | null;
  stone_slug: string | null;
}

// Mosaico de descoberta: posts com foto, mais recentes primeiro.
export async function fetchExplore(page: number): Promise<ExploreItem[]> {
  const from = page * EXPLORE_PAGE;
  const to = from + EXPLORE_PAGE - 1;

  const { data, error } = await db
    .from("posts")
    .select(`
      id, likes_count, availability,
      media:post_media ( storage_path, position ),
      post_stones ( stones ( name, slug ) )
    `)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any): ExploreItem | null => {
      const media = (p.media ?? []).sort(
        (a: { position: number }, b: { position: number }) => a.position - b.position
      )[0];
      if (!media) return null;
      const stone = p.post_stones?.[0]?.stones ?? null;
      return {
        post_id: p.id,
        media_path: media.storage_path,
        likes_count: p.likes_count,
        availability: p.availability,
        stone_name: stone?.name ?? null,
        stone_slug: stone?.slug ?? null,
      };
    })
    .filter(Boolean) as ExploreItem[];
}

export async function fetchStoneBySlug(slug: string): Promise<Stone | null> {
  const { data, error } = await db.from("stones").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

// Todas as publicações de uma pedra (de todas as empresas), agregadas.
export async function fetchStonePosts(stoneId: string, page: number): Promise<ExploreItem[]> {
  const from = page * EXPLORE_PAGE;
  const to = from + EXPLORE_PAGE - 1;

  const { data, error } = await db
    .from("post_stones")
    .select(`
      posts!inner (
        id, likes_count, availability, created_at,
        media:post_media ( storage_path, position )
      )
    `)
    .eq("stone_id", stoneId)
    .order("created_at", { foreignTable: "posts", ascending: false })
    .range(from, to);

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((row: any): ExploreItem | null => {
      const p = row.posts;
      if (!p) return null;
      const media = (p.media ?? []).sort(
        (a: { position: number }, b: { position: number }) => a.position - b.position
      )[0];
      if (!media) return null;
      return {
        post_id: p.id,
        media_path: media.storage_path,
        likes_count: p.likes_count,
        availability: p.availability,
        stone_name: null,
        stone_slug: null,
      };
    })
    .filter(Boolean) as ExploreItem[];
}

export async function listStonesWithCover(): Promise<Stone[]> {
  const { data, error } = await db.from("stones").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export { EXPLORE_PAGE };
