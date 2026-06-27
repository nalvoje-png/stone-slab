import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Bell, Sparkles, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "@/features/auth/api/auth.api";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { useFeed, useToggleLike, useToggleSave } from "../hooks/useFeed";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostCard, PostCardSkeleton } from "./PostCard";
import { CreatePostModal } from "./CreatePostModal";
import type { FeedPost } from "@/types/database";

export function FeedPage() {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();

  const posts = data?.pages.flat() ?? [];
  const sentinel = useInfiniteScroll(
    () => hasNextPage && !isFetchingNextPage && fetchNextPage(),
    Boolean(hasNextPage)
  );

  return (
    <>
      {/* Topo minimalista: logo + ações discretas */}
      <header className="mb-3 flex items-center justify-between px-1">
        <Logo />
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCreateOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
            aria-label={t("nav.create")}
          >
            <Plus className="h-6 w-6" strokeWidth={1.9} />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
            aria-label={t("nav.notifications")}
          >
            <Bell className="h-[22px] w-[22px]" strokeWidth={1.9} />
          </button>
          <button
            onClick={handleSignOut}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary hover:text-destructive lg:hidden"
            aria-label={t("nav.signOut")}
          >
            <LogOut className="h-[21px] w-[21px]" strokeWidth={1.9} />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div>
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
        <div>
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
            <p className="py-8 text-center text-caption text-muted-foreground">{t("feed.end")}</p>
          )}
        </div>
      )}

      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
