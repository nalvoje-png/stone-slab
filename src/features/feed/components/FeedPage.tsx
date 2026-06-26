import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/lib/version";
import { useFeed, useToggleLike, useToggleSave } from "../hooks/useFeed";
import { PostCard, PostCardSkeleton } from "./PostCard";
import { CreatePostModal } from "./CreatePostModal";
import type { FeedPost } from "@/types/database";

export function FeedPage() {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();

  const posts = data?.pages.flat() ?? [];

  // Infinite scroll via IntersectionObserver
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(onIntersect, { rootMargin: "400px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [onIntersect]);

  return (
    <>
      <header className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-h1 text-foreground">{t("nav.feed")}</h1>
        <div className="flex items-center gap-3">
          <span className="text-caption text-muted-foreground">v{APP_VERSION}</span>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> {t("nav.create")}
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-5">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={t("feed.empty")}
          description={t("feed.emptyDesc")}
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> {t("nav.create")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {posts.map((post: FeedPost) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleLike={(p) => toggleLike.mutate(p)}
              onToggleSave={(p) => toggleSave.mutate(p)}
            />
          ))}

          <div ref={sentinel} className="h-4" />

          {isFetchingNextPage && <PostCardSkeleton />}
          {!hasNextPage && posts.length > 0 && (
            <p className="py-6 text-center text-caption text-muted-foreground">{t("feed.end")}</p>
          )}
        </div>
      )}

      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
