import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Gem } from "lucide-react";
import { listStonesWithCover } from "../api/stones.api";

const typeColor: Record<string, string> = {
  quartzito: "from-sky-500 to-blue-700",
  marmore: "from-stone-300 to-stone-500",
  granito: "from-emerald-600 to-emerald-900",
  onix: "from-amber-400 to-orange-600",
};

export function StonesIndexPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: stones = [], isLoading } = useQuery({
    queryKey: ["stones"],
    queryFn: listStonesWithCover,
  });

  return (
    <div>
      <header className="mb-5">
        <h1 className="font-display text-h1 text-foreground">{t("nav.stones")}</h1>
        <p className="mt-1 text-body text-muted-foreground">{t("stone.indexDesc")}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-secondary" />
            ))
          : stones.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/stones/${s.slug}`)}
                className={`group relative aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br ${
                  typeColor[s.stone_type ?? ""] ?? "from-slate-400 to-slate-600"
                } p-4 text-left shadow-sm transition-transform active:scale-[0.98]`}
              >
                <div className="absolute inset-0 bg-foreground/10 transition-colors group-hover:bg-foreground/0" />
                <Gem className="absolute right-3 top-3 h-5 w-5 text-white/40" />
                <div className="absolute bottom-0 left-0 p-4">
                  <span className="font-display text-h3 font-500 text-white drop-shadow">
                    {s.name}
                  </span>
                  {s.stone_type && (
                    <span className="block text-caption capitalize text-white/80">
                      {s.stone_type}
                    </span>
                  )}
                </div>
              </button>
            ))}
      </div>
    </div>
  );
}
