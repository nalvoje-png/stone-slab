import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ImageOff } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PhotoViewer } from "@/features/feed/components/PhotoViewer";
import { browseSlabs, getBundle, showroomMediaUrl } from "../api/stock.api";
import { areaSqm, sqmToSqft, slabValue, usd, fmtSqm, fmtSqft } from "../lib/calc";
import type { SlabStatus } from "@/types/database";

const statusCls: Record<SlabStatus, string> = {
  disponivel: "bg-success-soft text-success",
  reservada: "bg-warning-soft text-warning",
  vendida: "bg-destructive-soft text-destructive",
};

export function ShowroomBundlePage() {
  const { bundleId } = useParams<{ companyId: string; bundleId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewer, setViewer] = useState<{ src: string; title: string } | null>(null);

  const { data: bundle } = useQuery({
    queryKey: ["browse-bundle", bundleId],
    queryFn: () => getBundle(bundleId!),
    enabled: Boolean(bundleId),
  });

  const { data: slabs = [], isLoading } = useQuery({
    queryKey: ["browse-slabs", bundleId],
    queryFn: () => browseSlabs(bundleId!),
    enabled: Boolean(bundleId),
  });

  const priceSqm = bundle?.price_sqm ?? null;

  return (
    <div className="px-4 lg:px-0">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("auth.back")}
      </button>

      <header className="mb-5">
        <h1 className="font-display text-h1 text-foreground">{t("showroom.bundle")} {bundle?.bundle_number}</h1>
        <p className="mt-1 text-body text-muted-foreground">
          {[bundle?.thickness, bundle?.finish].filter(Boolean).join(" • ")}
          {priceSqm != null && ` • ${usd(priceSqm)}/m² · ${usd(bundle?.price_sqft ?? null)}/ft²`}
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-secondary" />)}
        </div>
      ) : slabs.length === 0 ? (
        <EmptyState icon={ImageOff} title={t("showroom.noSlabs")} description={t("showroom.noSlabsDesc")} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {slabs.map((s) => {
            const sqm = s.length_m && s.height_m ? areaSqm(s.length_m, s.height_m) : null;
            const value = sqm != null ? slabValue(sqm, priceSqm) : null;
            const sold = s.status === "vendida";
            return (
              <div key={s.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <button
                  onClick={() => s.photo_path && setViewer({ src: showroomMediaUrl(s.photo_path), title: s.code })}
                  className="relative block aspect-[3/4] w-full overflow-hidden bg-secondary"
                >
                  {s.photo_path ? (
                    <img src={showroomMediaUrl(s.photo_path)} alt={s.code} loading="lazy"
                      className={`h-full w-full object-cover transition-transform duration-500 hover:scale-105 ${sold ? "opacity-50" : ""}`} />
                  ) : (
                    <div className="flex h-full items-center justify-center"><ImageOff className="h-7 w-7 text-muted-foreground" /></div>
                  )}
                  <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${statusCls[s.status]}`}>
                    {t(`stock.status.${s.status}`)}
                  </span>
                </button>
                <div className="p-3">
                  <div className="text-[13.5px] font-semibold text-foreground">{s.code}</div>
                  {sqm != null && (
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                      {s.length_m} × {s.height_m} m · {fmtSqm(sqm)} · {fmtSqft(sqmToSqft(sqm))}
                    </div>
                  )}
                  {value != null && <div className="mt-1 text-[14px] font-semibold text-success">{usd(value)}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewer && <PhotoViewer src={viewer.src} title={viewer.title} onClose={() => setViewer(null)} />}
    </div>
  );
}
