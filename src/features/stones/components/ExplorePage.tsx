import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Compass } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Chip } from "@/components/ui/chip";
import { useExplore } from "../hooks/useExplore";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { listStonesWithCover, type ExploreItem } from "../api/stones.api";
import { MosaicGrid, MosaicSkeleton } from "./MosaicGrid";

export function ExplorePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useExplore();
  const { data: stones = [] } = useQuery({ queryKey: ["stones"], queryFn: listStonesWithCover });

  const items = data?.pages.flat() ?? [];
  const sentinel = useInfiniteScroll(
    () => hasNextPage && !isFetchingNextPage && fetchNextPage(),
    Boolean(hasNextPage)
  );

  function openItem(item: ExploreItem) {
    if (item.stone_slug) navigate(`/stones/${item.stone_slug}`);
  }

  return (
    <div className="-mx-4 lg:mx-0">
      <header className="mb-4 px-4 lg:px-0">
        <h1 className="font-display text-h1 text-foreground">{t("nav.explore")}</h1>
      </header>

      {/* Chips de pedras populares — atalho para as Páginas das Pedras */}
      <div className="mb-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stones.map((s) => (
          <Chip key={s.id} className="shrink-0" onClick={() => navigate(`/stones/${s.slug}`)}>
            {s.name}
          </Chip>
        ))}
      </div>

      {isLoading ? (
        <MosaicSkeleton />
      ) : items.length === 0 ? (
        <EmptyState icon={Compass} title={t("explore.empty")} description={t("explore.emptyDesc")} />
      ) : (
        <>
          <MosaicGrid items={items} onItemClick={openItem} />
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
