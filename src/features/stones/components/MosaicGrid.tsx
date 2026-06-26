import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/features/feed/api/feed.api";
import type { ExploreItem } from "../api/stones.api";

interface MosaicTileProps {
  item: ExploreItem;
  featured?: boolean;
  onClick?: (item: ExploreItem) => void;
}

const availabilityRing: Record<string, string> = {
  disponivel: "after:bg-success",
  reservado: "after:bg-warning",
  vendido: "after:bg-destructive",
};

function MosaicTile({ item, featured, onClick }: MosaicTileProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      onClick={() => onClick?.(item)}
      className={cn(
        "group relative overflow-hidden bg-secondary",
        featured ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
      )}
    >
      {!loaded && <div className="absolute inset-0 animate-pulse bg-secondary" />}
      <img
        src={mediaUrl(item.media_path)}
        alt={item.stone_name ?? ""}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-all duration-500 group-hover:scale-105",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Overlay no hover — discreto, não polui a foto */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex items-center justify-between p-3 text-primary-foreground">
          {item.stone_name && (
            <span className="font-display text-sm font-500 drop-shadow">{item.stone_name}</span>
          )}
          {item.likes_count > 0 && (
            <span className="ml-auto flex items-center gap-1 text-caption font-medium">
              <Heart className="h-3.5 w-3.5 fill-current" /> {item.likes_count}
            </span>
          )}
        </div>
      </div>

      {/* ponto de status no canto */}
      {item.availability !== "nenhuma" && availabilityRing[item.availability] && (
        <span
          className={cn(
            "absolute right-2 top-2 h-2.5 w-2.5 rounded-full ring-2 ring-white/80",
            "after:absolute after:inset-0 after:rounded-full",
            availabilityRing[item.availability]
          )}
        />
      )}
    </button>
  );
}

interface MosaicGridProps {
  items: ExploreItem[];
  onItemClick?: (item: ExploreItem) => void;
  irregular?: boolean;
}

// Mosaico estilo Instagram Explore. Quando irregular, a cada 10 itens
// um vira destaque (2x2), criando o ritmo visual característico.
export function MosaicGrid({ items, onItemClick, irregular = true }: MosaicGridProps) {
  return (
    <div className="grid auto-rows-[1fr] grid-cols-3 gap-1 sm:gap-1.5 [&>*]:aspect-square">
      {items.map((item, i) => (
        <MosaicTile
          key={item.post_id}
          item={item}
          featured={irregular && i % 10 === 0}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
}

export function MosaicSkeleton() {
  return (
    <div className="grid auto-rows-[1fr] grid-cols-3 gap-1 sm:gap-1.5 [&>*]:aspect-square">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className={cn("animate-pulse bg-secondary", i === 0 && "col-span-2 row-span-2")}
        />
      ))}
    </div>
  );
}
