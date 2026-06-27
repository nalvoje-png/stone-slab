import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Lock, ShieldCheck, PackageOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { flagEmoji, countryName } from "@/lib/country";
import { mediaUrl } from "@/features/feed/api/feed.api";
import {
  checkCatalogAccess,
  fetchCompanyProfile,
  fetchCompanyPosts,
} from "../api/catalog.api";

export function CatalogPortalPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "pt";
  const navigate = useNavigate();

  const { data: hasAccess, isLoading: checking } = useQuery({
    queryKey: ["catalog-access", companyId],
    queryFn: () => checkCatalogAccess(companyId!),
    enabled: Boolean(companyId),
  });

  const { data: company } = useQuery({
    queryKey: ["company-profile", companyId],
    queryFn: () => fetchCompanyProfile(companyId!),
    enabled: Boolean(companyId) && hasAccess === true,
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["company-posts", companyId],
    queryFn: () => fetchCompanyPosts(companyId!),
    enabled: Boolean(companyId) && hasAccess === true,
  });

  if (checking) {
    return <div className="h-48 animate-pulse rounded-lg bg-secondary" />;
  }

  // Barrado: sem acesso aprovado
  if (!hasAccess) {
    return (
      <div className="px-4 lg:px-0">
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {t("auth.back")}
        </button>
        <EmptyState
          icon={Lock}
          title={t("portal.noAccessTitle")}
          description={t("portal.noAccessDesc")}
        />
      </div>
    );
  }

  const flag = flagEmoji(company?.country_code);
  const country = countryName(company?.country_code, lang);

  return (
    <div className="px-4 lg:px-0">
      {/* Cabeçalho do portal */}
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("auth.back")}
      </button>

      {company && (
        <div className="mb-5 flex items-center gap-4 rounded-lg border border-border bg-card p-5">
          <Avatar src={company.avatar_url} name={company.display_name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-h2 text-foreground">
              {company.company_name || company.display_name}
            </h1>
            <p className="text-body text-muted-foreground">
              {t(`accountType.${company.account_type}`)}
              {country && ` • ${country} ${flag}`}
            </p>
          </div>
        </div>
      )}

      {/* Selo de ambiente privado */}
      <div className="mb-5 flex items-center gap-2 rounded-md bg-primary-soft px-4 py-3 text-[13.5px] text-primary">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        {t("portal.privateNotice")}
      </div>

      {/* Conteúdo: por enquanto, as publicações da empresa em ambiente privado.
          Estoque, preços e chapas chegam na próxima etapa. */}
      <h2 className="mb-3 text-h3 text-foreground">{t("portal.materials")}</h2>

      {loadingPosts ? (
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-md bg-secondary" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState icon={PackageOpen} title={t("portal.emptyTitle")} description={t("portal.emptyDesc")} />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {posts.map((p: any) => (
            <div key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
              {p.media_path && (
                <div className="aspect-square bg-secondary">
                  <img src={mediaUrl(p.media_path)} alt={p.stone_name ?? ""} className="h-full w-full object-cover" loading="lazy" />
                </div>
              )}
              {p.stone_name && (
                <div className="px-2.5 py-2 text-[13px] font-medium text-foreground">{p.stone_name}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Prévia do que vem no portal completo */}
      <div className="mt-8 rounded-lg border border-dashed border-border p-5 text-center">
        <p className="text-body text-muted-foreground">{t("portal.comingSoon")}</p>
        <Button variant="outline" className="mt-3" disabled>
          {t("portal.stock")}
        </Button>
      </div>
    </div>
  );
}
