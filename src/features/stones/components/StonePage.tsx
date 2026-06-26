import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Gem } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { mediaUrl } from "@/features/feed/api/feed.api";
import { fetchStoneBySlug, type ExploreItem } from "../api/stones.api";
import { useStonePosts } from "../hooks/useExplore";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { MosaicGrid, MosaicSkeleton } from "./MosaicGrid";

export function StonePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: stone, isLoading: loadingStone } = useQuery({
    queryKey: ["stone", slug],
    queryFn: () => fetchStoneBySlug(slug!),
    enabled: Boolean(slug),
  });

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useStonePosts(stone?.id);
  const items: ExploreItem[] = data?.pages.flat() ?? [];

  const sentinel = useInfiniteScroll(
    () => hasNextPage && !isFetchingNextPage && fetchNextPage(),
    Boolean(hasNextPage)
  );

  if (loadingStone) {
    return <div className="h-40 animate-pulse rounded-lg bg-secondary" />;
  }

  if (!stone) {
    return (
      <EmptyState icon={Gem} title={t("stone.notFound")} description={t("stone.notFoundDesc")} />
    );
  }

  const cover = items[0]?.media_path;

  return (
    <div className="-mx-4 lg:mx-0">
      {/* Hero editorial da pedra */}
      <div className="relative mb-5 h-44 overflow-hidden bg-brand sm:h-56 lg:rounded-xl">
        {cover && (
          <img
            src={mediaUrl(cover)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/20 text-primary-foreground backdrop-blur transition-colors hover:bg-background/30"
          aria-label={t("auth.back")}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="absolute bottom-0 left-0 p-5 text-primary-foreground">
          <p className="text-caption font-medium uppercase tracking-[0.12em] opacity-80">
            {stone.stone_type ?? t("nav.stones")}
          </p>
          <h1 className="font-display text-display font-500 leading-none drop-shadow">
            {stone.name}
          </h1>
          <p className="mt-2 text-caption opacity-90">
            {items.length} {items.length === 1 ? t("stone.post") : t("stone.posts")}
          </p>
        </div>
      </div>

      {isLoading ? (
        <MosaicSkeleton />
      ) : items.length === 0 ? (
        <div className="px-4 lg:px-0">
          <EmptyState icon={Gem} title={t("stone.emptyTitle")} description={t("stone.emptyDesc")} />
        </div>
      ) : (
        <>
          <MosaicGrid items={items} irregular />
          <div ref={sentinel} className="h-4" />
          {isFetchingNextPage && (
            <div className="mt-1.5">
              <MosaicSkeleton />
            </div>
          )}
        </>
      )}
    </div>
  );
}
