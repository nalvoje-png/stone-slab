import { supabase } from "@/lib/supabase";
import type { FeedPost, Stone } from "@/types/database";

// O cliente tipado infere `never` em selects com joins aninhados profundos.
// Para essas chamadas usamos uma view destipada do client; os tipos fortes
// ficam garantidos na fronteira (parâmetros e tipo de retorno das funções).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const PAGE_SIZE = 8;

// URL pública de um arquivo do bucket post-media
export function mediaUrl(path: string) {
  return supabase.storage.from("post-media").getPublicUrl(path).data.publicUrl;
}


// Busca uma página do feed, já com autor, mídia, pedras e estado de like/save do usuário.
export async function fetchFeed(page: number, userId: string): Promise<FeedPost[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: posts, error } = await db
    .from("posts")
    .select(`
      *,
      author:profiles!posts_author_id_fkey (
        id, display_name, username, avatar_url, company_name, account_type, is_verified
      ),
      media:post_media ( * ),
      post_stones ( stones ( * ) )
    `)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  if (!posts || posts.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = posts as any[];
  const postIds = rows.map((p) => p.id);

  const [{ data: likes }, { data: saves }] = await Promise.all([
    db.from("likes").select("post_id").eq("user_id", userId).in("post_id", postIds),
    db.from("saved_posts").select("post_id").eq("user_id", userId).in("post_id", postIds),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const likedSet = new Set((likes ?? []).map((l: any) => l.post_id));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const savedSet = new Set((saves ?? []).map((s: any) => s.post_id));

  return rows.map((p): FeedPost => ({
    ...p,
    media: (p.media ?? []).sort(
      (a: { position: number }, b: { position: number }) => a.position - b.position
    ),
    stones: (p.post_stones ?? [])
      .map((ps: { stones: Stone }) => ps.stones)
      .filter(Boolean),
    liked_by_me: likedSet.has(p.id),
    saved_by_me: savedSet.has(p.id),
  }));
}

export async function toggleLike(postId: string, userId: string, liked: boolean) {
  if (liked) {
    const { error } = await db.from("likes").delete().match({ post_id: postId, user_id: userId });
    if (error) throw error;
  } else {
    const { error } = await db.from("likes").insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
}

export async function toggleSave(postId: string, userId: string, saved: boolean) {
  if (saved) {
    const { error } = await db.from("saved_posts").delete().match({ post_id: postId, user_id: userId });
    if (error) throw error;
  } else {
    const { error } = await db.from("saved_posts").insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
}

export async function listStones(): Promise<Stone[]> {
  const { data, error } = await db.from("stones").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export interface CreatePostInput {
  authorId: string;
  caption: string;
  availability: "disponivel" | "reservado" | "vendido" | "nenhuma";
  location: string;
  stoneIds: string[];
  file: File;
}

export async function createPost(input: CreatePostInput) {
  // 1. cria o post
  const { data: post, error: postErr } = await db
    .from("posts")
    .insert({
      author_id: input.authorId,
      caption: input.caption || null,
      availability: input.availability,
      location: input.location || null,
    })
    .select()
    .single();
  if (postErr) throw postErr;

  // 2. envia a foto para post-media/{userId}/{postId}.ext
  const ext = input.file.name.split(".").pop() || "jpg";
  const path = `${input.authorId}/${post.id}.${ext}`;
  const { error: upErr } = await db.storage
    .from("post-media")
    .upload(path, input.file, { upsert: true });
  if (upErr) throw upErr;

  // 3. registra a mídia
  const { error: medErr } = await db
    .from("post_media")
    .insert({ post_id: post.id, storage_path: path, position: 0 });
  if (medErr) throw medErr;

  // 4. vincula pedras
  if (input.stoneIds.length) {
    const rows = input.stoneIds.map((stone_id) => ({ post_id: post.id, stone_id }));
    const { error: stErr } = await db.from("post_stones").insert(rows);
    if (stErr) throw stErr;
  }

  return post;
}
