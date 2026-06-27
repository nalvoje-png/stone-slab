import { useTranslation } from "react-i18next";
import { KeyRound, Clock, Check, X, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { flagEmoji, countryName } from "@/lib/country";
import { useOutgoingRequests, useCancelRequest } from "../hooks/useRequests";
import type { CatalogRequestWithProfile, RequestStatus } from "@/types/database";

export function MyAccessPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "pt";
  const { data: requests = [], isLoading } = useOutgoingRequests();
  const cancel = useCancelRequest();

  return (
    <div className="px-4 lg:px-0">
      <header className="mb-5">
        <h1 className="font-display text-h1 text-foreground">{t("catalog.myAccessTitle")}</h1>
        <p className="mt-1 text-body text-muted-foreground">{t("catalog.myAccessDesc")}</p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState icon={KeyRound} title={t("catalog.noOutgoing")} description={t("catalog.noOutgoingDesc")} />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <AccessRow
              key={req.id}
              req={req}
              lang={lang}
              onCancel={() => cancel.mutate(req.id)}
              canceling={cancel.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const statusMeta: Record<RequestStatus, { icon: typeof Clock; cls: string }> = {
  pendente: { icon: Clock, cls: "text-muted-foreground" },
  aprovado: { icon: Check, cls: "text-success" },
  recusado: { icon: X, cls: "text-destructive" },
};

function AccessRow({
  req, lang, onCancel, canceling,
}: {
  req: CatalogRequestWithProfile;
  lang: string;
  onCancel: () => void;
  canceling: boolean;
}) {
  const { t } = useTranslation();
  const c = req.company;
  if (!c) return null;
  const flag = flagEmoji(c.country_code);
  const country = countryName(c.country_code, lang);
  const meta = statusMeta[req.status];
  const Icon = meta.icon;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <Avatar src={c.avatar_url} name={c.display_name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold text-foreground">
          {c.company_name || c.display_name}
        </div>
        <div className="text-[12.5px] text-muted-foreground">
          {t(`accountType.${c.account_type}`)}
          {country && ` • ${country} ${flag}`}
        </div>
      </div>

      <div className={`flex items-center gap-1.5 text-[13px] font-medium ${meta.cls}`}>
        <Icon className="h-4 w-4" />
        {t(`catalog.status.${req.status}`)}
      </div>

      {req.status === "pendente" && (
        <button
          onClick={onCancel}
          disabled={canceling}
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive disabled:opacity-50"
          aria-label={t("catalog.cancel")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
