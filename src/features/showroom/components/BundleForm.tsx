import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCreateBundle } from "../hooks/useStock";
import { pricePerSqmToSqft, pricePerSqftToSqm, usd } from "../lib/calc";

// Cadastro de um bando. O preço pode ser informado por m² OU por pé²;
// o sistema preenche o outro automaticamente.
export function BundleForm({ materialId, onDone }: { materialId: string; onDone: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const createBundle = useCreateBundle();

  const [bundleNumber, setBundleNumber] = useState("");
  const [thickness, setThickness] = useState("");
  const [finish, setFinish] = useState("");
  const [priceSqm, setPriceSqm] = useState<string>("");
  const [priceSqft, setPriceSqft] = useState<string>("");

  // edição cruzada: digitar m² preenche pé² e vice-versa
  function onPriceSqm(v: string) {
    setPriceSqm(v);
    const n = parseFloat(v);
    setPriceSqft(isNaN(n) ? "" : String(pricePerSqmToSqft(n)));
  }
  function onPriceSqft(v: string) {
    setPriceSqft(v);
    const n = parseFloat(v);
    setPriceSqm(isNaN(n) ? "" : String(pricePerSqftToSqm(n)));
  }

  async function handleSave() {
    if (!bundleNumber.trim()) return;
    await createBundle.mutateAsync({
      company_id: user!.id,
      material_id: materialId,
      bundle_number: bundleNumber.trim(),
      thickness: thickness.trim() || undefined,
      finish: finish.trim() || undefined,
      price_sqm: priceSqm ? parseFloat(priceSqm) : undefined,
      price_sqft: priceSqft ? parseFloat(priceSqft) : undefined,
    });
    onDone();
  }

  const inputCls = "h-11 w-full rounded-lg border border-input bg-background px-3 text-body text-foreground outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "mb-1.5 block text-[13px] font-medium text-foreground";

  return (
    <div className="mb-5 rounded-lg border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t("stock.bundleNumber")}</label>
          <input value={bundleNumber} onChange={(e) => setBundleNumber(e.target.value)} placeholder="1" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t("stock.thickness")}</label>
          <input value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder="2cm" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t("stock.finish")}</label>
          <input value={finish} onChange={(e) => setFinish(e.target.value)} placeholder={t("stock.finishPlaceholder")} className={inputCls} />
        </div>
        <div />
        <div>
          <label className={labelCls}>{t("stock.priceSqm")} (USD)</label>
          <input value={priceSqm} onChange={(e) => onPriceSqm(e.target.value)} placeholder="0.00" inputMode="decimal" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t("stock.priceSqft")} (USD)</label>
          <input value={priceSqft} onChange={(e) => onPriceSqft(e.target.value)} placeholder="0.00" inputMode="decimal" className={inputCls} />
        </div>
      </div>

      {(priceSqm || priceSqft) && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-success-soft px-3 py-2.5 text-[12.5px] text-success">
          <Calculator className="h-4 w-4 shrink-0" />
          {t("stock.priceHint", { sqm: usd(parseFloat(priceSqm) || 0), sqft: usd(parseFloat(priceSqft) || 0) })}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button onClick={handleSave} disabled={createBundle.isPending || !bundleNumber.trim()}>
          {createBundle.isPending ? t("stock.saving") : t("stock.saveBundle")}
        </Button>
        <Button variant="outline" onClick={onDone}>{t("stock.cancel")}</Button>
      </div>
      <p className="mt-2 text-caption text-muted-foreground">{t("stock.addSlabsAfter")}</p>
    </div>
  );
}
