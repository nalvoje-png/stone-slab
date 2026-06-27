import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Gem, Trash2, ChevronRight, Boxes } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useMaterials, useCreateMaterial, useDeleteMaterial } from "../hooks/useStock";
import { showroomMediaUrl, uploadShowroomPhoto } from "../api/stock.api";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function StockMaterialsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: materials = [], isLoading } = useMaterials();
  const createMaterial = useCreateMaterial();
  const deleteMaterial = useDeleteMaterial();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      let coverPath: string | undefined;
      if (coverFile) coverPath = await uploadShowroomPhoto(coverFile, user!.id);
      await createMaterial.mutateAsync({ name: name.trim(), coverPath });
      setName(""); setCoverFile(null); setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 lg:px-0">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 text-foreground">{t("stock.title")}</h1>
          <p className="mt-1 text-body text-muted-foreground">{t("stock.subtitle")}</p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> {t("stock.newMaterial")}
        </Button>
      </header>

      {showForm && (
        <div className="mb-5 rounded-lg border border-border bg-card p-4">
          <div className="mb-3">
            <label className="mb-1.5 block text-[13px] font-medium text-foreground">{t("stock.materialName")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ocean Fantasy"
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-body text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-medium text-foreground">{t("stock.coverPhoto")}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="block w-full text-[13px] text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-foreground"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={saving || !name.trim()}>
              {saving ? t("stock.saving") : t("stock.save")}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>{t("stock.cancel")}</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      ) : materials.length === 0 ? (
        <EmptyState icon={Boxes} title={t("stock.emptyTitle")} description={t("stock.emptyDesc")} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {materials.map((m) => (
            <div key={m.id} className="group relative overflow-hidden rounded-lg border border-border bg-card">
              <button onClick={() => navigate(`/stock/material/${m.id}`)} className="block w-full text-left">
                <div className="aspect-[4/3] bg-secondary">
                  {m.cover_path ? (
                    <img src={showroomMediaUrl(m.cover_path)} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><Gem className="h-8 w-8 text-muted-foreground" /></div>
                  )}
                </div>
                <div className="flex items-center justify-between p-3">
                  <span className="font-display text-[16px] font-500 text-foreground">{m.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
              <button
                onClick={() => { if (confirm(t("stock.confirmDeleteMaterial"))) deleteMaterial.mutate(m.id); }}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/70 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-destructive group-hover:opacity-100"
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
