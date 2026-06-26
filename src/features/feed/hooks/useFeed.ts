import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { fetchFeed, toggleLike, toggleSave } from "../api/feed.api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { FeedPost } from "@/types/database";

type FeedPages = InfiniteData<FeedPost[]>;

export function useFeed() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  return useInfiniteQuery({
    queryKey: ["feed", userId],
    enabled: Boolean(userId),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchFeed(pageParam, userId),
    getNextPageParam: (last, all) => (last.length === 8 ? all.length : undefined),
  });
}

// Aplica uma transformação a um post específico em todas as páginas em cache.
function patchPost(data: FeedPages | undefined, postId: string, fn: (p: FeedPost) => FeedPost): FeedPages | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => page.map((p) => (p.id === postId ? fn(p) : p))),
  };
}

export function useToggleLike() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["feed", user?.id ?? ""];

  return useMutation({
    mutationFn: (post: FeedPost) => toggleLike(post.id, user!.id, post.liked_by_me),
    onMutate: async (post) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<FeedPages>(key);
      qc.setQueryData<FeedPages>(key, (d) =>
        patchPost(d, post.id, (p) => ({
          ...p,
          liked_by_me: !p.liked_by_me,
          likes_count: p.likes_count + (p.liked_by_me ? -1 : 1),
        }))
      );
      return { prev };
    },
    onError: (_e, _post, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
  });
}

export function useToggleSave() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["feed", user?.id ?? ""];

  return useMutation({
    mutationFn: (post: FeedPost) => toggleSave(post.id, user!.id, post.saved_by_me),
    onMutate: async (post) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<FeedPages>(key);
      qc.setQueryData<FeedPages>(key, (d) =>
        patchPost(d, post.id, (p) => ({ ...p, saved_by_me: !p.saved_by_me }))
      );
      return { prev };
    },
    onError: (_e, _post, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
  });
}
