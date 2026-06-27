import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Lock, ShieldCheck, PackageOpen, Crown } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { flagEmoji, countryName } from "@/lib/country";
import { mediaUrl } from "@/features/feed/api/feed.api";
import {
  fetchMyTier,
  fetchCompanyProfile,
  fetchCompanyPosts,
} from "../api/catalog.api";

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

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["company-posts", companyId],
    queryFn: () => fetchCompanyPosts(companyId!),
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
  const cover = posts[0]?.media_path;

  return (
    <div className="-mx-4 lg:mx-0">
      {/* Banner institucional do Showroom */}
      <div className="relative mb-0 h-48 overflow-hidden bg-brand sm:h-60 lg:rounded-t-xl">
        {cover && (
          <img src={mediaUrl(cover)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
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

      {/* Cabeçalho da empresa, sobreposto ao banner */}
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

        {/* Selo do nível do usuário */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-[13px] font-medium text-primary">
            {tier?.is_owner ? <Crown className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            {t("portal.yourLevel")}: {tier?.is_owner ? t("portal.owner") : tier?.tier_name}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-md bg-secondary px-4 py-3 text-[13px] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          {t("portal.privateNotice")}
        </div>
      </div>

      {/* Materiais */}
      <div className="mt-6 px-4 lg:px-6">
        <h2 className="mb-3 text-h3 text-foreground">{t("portal.materials")}</h2>

        {loadingPosts ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState icon={PackageOpen} title={t("portal.emptyTitle")} description={t("portal.emptyDesc")} />
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {posts.map((p: any) => (
              <div key={p.id} className="group overflow-hidden rounded-lg border border-border bg-card">
                {p.media_path && (
                  <div className="aspect-square overflow-hidden bg-secondary">
                    <img src={mediaUrl(p.media_path)} alt={p.stone_name ?? ""} loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                {p.stone_name && (
                  <div className="px-2.5 py-2 text-[13px] font-medium text-foreground">{p.stone_name}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-lg border border-dashed border-border p-5 text-center">
          <p className="text-body text-muted-foreground">{t("portal.comingSoon")}</p>
        </div>
      </div>
    </div>
  );
}
