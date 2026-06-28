import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Trash2, ImagePlus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSlabs, useCreateSlab, useDeleteSlab } from "../hooks/useStock";
import { uploadShowroomPhoto, showroomMediaUrl } from "../api/stock.api";
import { areaSqm, sqmToSqft, slabValue, usd, fmtSqm, fmtSqft } from "../lib/calc";
import type { ShowroomBundle, SlabStatus } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const statusCls: Record<SlabStatus, string> = {
  disponivel: "bg-success-soft text-success",
  reservada: "bg-warning-soft text-warning",
  vendida: "bg-destructive-soft text-destructive",
};

export function StockBundlePage() {
  const { bundleId } = useParams<{ bundleId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: bundle } = useQuery({
    queryKey: ["bundle", bundleId],
    enabled: Boolean(bundleId),
    queryFn: async (): Promise<ShowroomBundle | null> => {
      const { data, error } = await db.from("showroom_bundles").select("*").eq("id", bundleId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: slabs = [], isLoading } = useSlabs(bundleId);
  const createSlab = useCreateSlab();
  const deleteSlab = useDeleteSlab(bundleId!);

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [lengthM, setLengthM] = useState("");
  const [heightM, setHeightM] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceSqm = bundle?.price_sqm ?? null;

  // prévia de cálculo ao digitar medidas
  const L = parseFloat(lengthM), H = parseFloat(heightM);
  const previewSqm = !isNaN(L) && !isNaN(H) ? areaSqm(L, H) : null;
  const previewValue = previewSqm != null ? slabValue(previewSqm, priceSqm) : null;

  async function handleAddSlab() {
    if (!code.trim()) return;
    setSaving(true);
    setError(null);
    try {
      let photoPath: string | undefined;
      if (photo) photoPath = await uploadShowroomPhoto(photo, user!.id);
      await createSlab.mutateAsync({
        company_id: user!.id,
        bundle_id: bundleId!,
        code: code.trim(),
        photo_path: photoPath,
        length_m: lengthM ? parseFloat(lengthM) : undefined,
        height_m: heightM ? parseFloat(heightM) : undefined,
      });
      setCode(""); setLengthM(""); setHeightM(""); setPhoto(null);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((e as any)?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "h-11 w-full rounded-lg border border-input bg-background px-3 text-body text-foreground outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "mb-1.5 block text-[13px] font-medium text-foreground";

  return (
    <div className="px-4 lg:px-0">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("auth.back")}
      </button>

      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 text-foreground">
            {t("stock.bundle")} {bundle?.bundle_number}
          </h1>
          <p className="mt-1 text-body text-muted-foreground">
            {[bundle?.thickness, bundle?.finish].filter(Boolean).join(" • ")}
            {priceSqm != null && ` • ${usd(priceSqm)}/m²`}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> {t("stock.addSlab")}
        </Button>
      </header>

      {showForm && (
        <div className="mb-5 rounded-lg border border-border bg-card p-4">
          <div className="mb-3">
            <label className={labelCls}>{t("stock.slabCode")}</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="OF-2024-001" className={inputCls} />
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t("stock.length")} (m)</label>
              <input value={lengthM} onChange={(e) => setLengthM(e.target.value)} placeholder="3.25" inputMode="decimal" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t("stock.height")} (m)</label>
              <input value={heightM} onChange={(e) => setHeightM(e.target.value)} placeholder="1.85" inputMode="decimal" className={inputCls} />
            </div>
          </div>
          <div className="mb-3">
            <label className={labelCls}>{t("stock.slabPhoto")}</label>
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="block w-full text-[13px] text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-foreground" />
          </div>

          {previewSqm != null && (
            <div className="mb-3 rounded-md bg-success-soft px-3 py-2.5 text-[12.5px] text-success">
              {fmtSqm(previewSqm)} • {fmtSqft(sqmToSqft(previewSqm))}
              {previewValue != null && ` • ${usd(previewValue)}`}
            </div>
          )}

          {error && (
            <div className="mb-3 rounded-md bg-destructive-soft px-3 py-2.5 text-[12.5px] text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleAddSlab} disabled={saving || !code.trim()}>
              {saving ? t("stock.saving") : t("stock.addSlab")}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>{t("stock.cancel")}</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2.5">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[68px] animate-pulse rounded-lg bg-secondary" />)}</div>
      ) : slabs.length === 0 ? (
        <EmptyState icon={ImagePlus} title={t("stock.noSlabs")} description={t("stock.noSlabsDesc")} />
      ) : (
        <div className="space-y-2.5">
          {slabs.map((s) => {
            const sqm = s.length_m && s.height_m ? areaSqm(s.length_m, s.height_m) : null;
            const value = sqm != null ? slabValue(sqm, priceSqm) : null;
            return (
              <div key={s.id} className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {s.photo_path && <img src={showroomMediaUrl(s.photo_path)} alt={s.code} className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-foreground">{s.code}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusCls[s.status]}`}>
                      {t(`stock.status.${s.status}`)}
                    </span>
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    {s.length_m && s.height_m ? `${s.length_m} × ${s.height_m} m · ${fmtSqm(sqm)}` : t("stock.noMeasures")}
                  </div>
                </div>
                {value != null && <span className="text-[14px] font-semibold text-success">{usd(value)}</span>}
                <button
                  onClick={() => { if (confirm(t("stock.confirmDeleteSlab"))) deleteSlab.mutate(s.id); }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  aria-label={t("stock.delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
