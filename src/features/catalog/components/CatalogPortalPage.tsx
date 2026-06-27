import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Lock, ShieldCheck, Crown, PackageOpen, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { flagEmoji, countryName } from "@/lib/country";
import { fetchMyTier, fetchCompanyProfile } from "../api/catalog.api";
import { browseMaterials, showroomMediaUrl } from "@/features/showroom/api/stock.api";

// Showroom Digital — ambiente privado da empresa visto pelo comprador aprovado.
// Mostra o ESTOQUE real (materiais → bandos → chapas), navegável.
export function CatalogPortalPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "pt";
  const navigate = useNavigate();

  const { data: tier, isLoading: checking } = useQuery({
    queryKey: ["my-tier", companyId],
    queryFn: () => fetchMyTier(companyId!),
    enabled: Boolean(companyId),
  });

  const hasAccess = Boolean(tier);

  const { data: company } = useQuery({
    queryKey: ["company-profile", companyId],
    queryFn: () => fetchCompanyProfile(companyId!),
    enabled: Boolean(companyId) && hasAccess,
  });

  const { data: materials = [], isLoading: loadingMaterials } = useQuery({
    queryKey: ["browse-materials", companyId],
    queryFn: () => browseMaterials(companyId!),
    enabled: Boolean(companyId) && hasAccess,
  });

  if (checking) {
    return <div className="h-56 animate-pulse rounded-lg bg-secondary" />;
  }

  if (!hasAccess) {
    return (
      <div className="px-4 lg:px-0">
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {t("auth.back")}
        </button>
        <EmptyState icon={Lock} title={t("portal.noAccessTitle")} description={t("portal.noAccessDesc")} />
      </div>
    );
  }

  const flag = flagEmoji(company?.country_code);
  const country = countryName(company?.country_code, lang);
  const cover = materials.find((m) => m.cover_path)?.cover_path;

  return (
    <div className="-mx-4 lg:mx-0">
      {/* Banner institucional */}
      <div className="relative h-48 overflow-hidden bg-brand sm:h-60 lg:rounded-t-xl">
        {cover && (
          <img src={showroomMediaUrl(cover)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/30 text-foreground backdrop-blur transition-colors hover:bg-background/50"
          aria-label={t("auth.back")}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Cabeçalho da empresa */}
      <div className="relative -mt-12 px-4 lg:px-6">
        <div className="flex items-end gap-4">
          <Avatar src={company?.avatar_url} name={company?.display_name ?? ""} size="xl" className="ring-4 ring-background" />
          <div className="min-w-0 flex-1 pb-1">
            <h1 className="truncate font-display text-h2 text-foreground">
              {company?.company_name || company?.display_name}
            </h1>
            <p className="text-body text-muted-foreground">
              {company && t(`accountType.${company.account_type}`)}
              {country && ` • ${country} ${flag}`}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-[13px] font-medium text-primary">
            {tier?.is_owner ? <Crown className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            {tier?.is_owner ? t("portal.owner") : t("catalog.partner")}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-md bg-secondary px-4 py-3 text-[13px] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          {t("portal.privateNotice")}
        </div>
      </div>

      {/* Materiais do estoque */}
      <div className="mt-6 px-4 lg:px-6">
        <h2 className="mb-3 text-h3 text-foreground">{t("portal.materials")}</h2>

        {loadingMaterials ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-secondary" />)}
          </div>
        ) : materials.length === 0 ? (
          <EmptyState icon={PackageOpen} title={t("portal.emptyTitle")} description={t("portal.emptyDesc")} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {materials.map((m) => (
              <button
                key={m.id}
                onClick={() => navigate(`/showroom/${companyId}/material/${m.id}`)}
                className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-transform active:scale-[0.98]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-secondary">
                  {m.cover_path ? (
                    <img src={showroomMediaUrl(m.cover_path)} alt={m.name} loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><PackageOpen className="h-8 w-8 text-muted-foreground" /></div>
                  )}
                </div>
                <div className="flex items-center justify-between p-3">
                  <span className="font-display text-[16px] font-500 text-foreground">{m.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
