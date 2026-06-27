import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Layers, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { browseBundles, getMaterial } from "../api/stock.api";
import { usd } from "../lib/calc";

// Comprador navegando os bandos de um material dentro do Showroom.
export function ShowroomMaterialPage() {
  const { companyId, materialId } = useParams<{ companyId: string; materialId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: material } = useQuery({
    queryKey: ["browse-material", materialId],
    queryFn: () => getMaterial(materialId!),
    enabled: Boolean(materialId),
  });

  const { data: bundles = [], isLoading } = useQuery({
    queryKey: ["browse-bundles", materialId],
    queryFn: () => browseBundles(materialId!),
    enabled: Boolean(materialId),
  });

  return (
    <div className="px-4 lg:px-0">
      <button onClick={() => navigate(`/catalog/${companyId}`)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("showroom.backToShowroom")}
      </button>

      <header className="mb-5">
        <h1 className="font-display text-h1 text-foreground">{material?.name}</h1>
        <p className="mt-1 text-body text-muted-foreground">{t("showroom.chooseBundle")}</p>
      </header>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-secondary" />)}</div>
      ) : bundles.length === 0 ? (
        <EmptyState icon={Layers} title={t("showroom.noBundles")} description={t("showroom.noBundlesDesc")} />
      ) : (
        <div className="space-y-3">
          {bundles.map((b) => (
            <button
              key={b.id}
              onClick={() => navigate(`/showroom/${companyId}/bundle/${b.id}`)}
              className="group flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-transform active:scale-[0.99]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Layers className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-foreground">{t("showroom.bundle")} {b.bundle_number}</div>
                <div className="text-[12.5px] text-muted-foreground">
                  {[b.thickness, b.finish].filter(Boolean).join(" • ")}
                  {b.price_sqm != null && ` • ${usd(b.price_sqm)}/m²`}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
