import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Layers, Trash2, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useBundles, useDeleteBundle } from "../hooks/useStock";
import { usd } from "../lib/calc";
import { BundleForm } from "./BundleForm";

export function StockMaterialPage() {
  const { materialId } = useParams<{ materialId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const { data: bundles = [], isLoading } = useBundles(materialId);
  const deleteBundle = useDeleteBundle(materialId!);

  return (
    <div className="px-4 lg:px-0">
      <button onClick={() => navigate("/stock")} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("stock.backToMaterials")}
      </button>

      <header className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-h1 text-foreground">{t("stock.bundles")}</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> {t("stock.newBundle")}
        </Button>
      </header>

      {showForm && materialId && (
        <BundleForm materialId={materialId} onDone={() => setShowForm(false)} />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-secondary" />)}
        </div>
      ) : bundles.length === 0 ? (
        <EmptyState icon={Layers} title={t("stock.noBundles")} description={t("stock.noBundlesDesc")} />
      ) : (
        <div className="space-y-3">
          {bundles.map((b) => (
            <div key={b.id} className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <button onClick={() => navigate(`/stock/bundle/${b.id}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Layers className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold text-foreground">
                    {t("stock.bundle")} {b.bundle_number}
                  </div>
                  <div className="text-[12.5px] text-muted-foreground">
                    {[b.thickness, b.finish].filter(Boolean).join(" • ")}
                    {b.price_sqm != null && ` • ${usd(b.price_sqm)}/m²`}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => { if (confirm(t("stock.confirmDeleteBundle"))) deleteBundle.mutate(b.id); }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                aria-label={t("stock.delete")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
