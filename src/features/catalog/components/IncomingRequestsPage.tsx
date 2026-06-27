import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Inbox, Check, X, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { flagEmoji, countryName } from "@/lib/country";
import { timeAgo } from "@/lib/time";
import { useIncomingRequests, useDecideRequest } from "../hooks/useRequests";
import { TierSelector } from "./TierSelector";
import type { CatalogRequestWithProfile, RequestStatus } from "@/types/database";

const FILTERS: (RequestStatus | "todos")[] = ["pendente", "aprovado", "recusado", "todos"];

export function IncomingRequestsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "pt";
  const [filter, setFilter] = useState<RequestStatus | "todos">("pendente");

  const { data: requests = [], isLoading } = useIncomingRequests();
  const decide = useDecideRequest();

  const filtered =
    filter === "todos" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="px-4 lg:px-0">
      <header className="mb-4">
        <h1 className="font-display text-h1 text-foreground">{t("catalog.incomingTitle")}</h1>
        <p className="mt-1 text-body text-muted-foreground">{t("catalog.incomingDesc")}</p>
      </header>

      <div className="mb-5 flex gap-2">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {t(`catalog.filter.${f}`)}
          </Chip>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Inbox} title={t("catalog.noIncoming")} description={t("catalog.noIncomingDesc")} />
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <RequestRow
              key={req.id}
              req={req}
              lang={lang}
              busy={decide.isPending}
              onApprove={() => decide.mutate({ id: req.id, status: "aprovado" })}
              onDecline={() => decide.mutate({ id: req.id, status: "recusado" })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestRow({
  req, lang, busy, onApprove, onDecline,
}: {
  req: CatalogRequestWithProfile;
  lang: string;
  busy: boolean;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const { t } = useTranslation();
  const p = req.requester;
  if (!p) return null;
  const flag = flagEmoji(p.country_code);
  const country = countryName(p.country_code, lang);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Avatar src={p.avatar_url} name={p.display_name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold text-foreground">
            {p.company_name || p.display_name}
          </div>
          <div className="text-[12.5px] text-muted-foreground">
            {t(`accountType.${p.account_type}`)}
            {country && ` • ${country} ${flag}`}
          </div>
        </div>
        <span className="text-caption text-muted-foreground">{timeAgo(req.created_at, lang)}</span>
      </div>

      {req.message && (
        <p className="mt-3 rounded-md bg-secondary p-3 text-[13.5px] text-foreground">{req.message}</p>
      )}

      {req.status === "pendente" ? (
        <div className="mt-3 flex gap-2">
          <button
            onClick={onApprove}
            disabled={busy}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {t("catalog.approve")}
          </button>
          <button
            onClick={onDecline}
            disabled={busy}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border text-[14px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            {t("catalog.decline")}
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <StatusPill status={req.status} />
          {req.status === "aprovado" && (
            <TierSelector requestId={req.id} currentTierId={req.tier_id} />
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: RequestStatus }) {
  const { t } = useTranslation();
  const map = {
    pendente: "bg-secondary text-muted-foreground",
    aprovado: "bg-success-soft text-success",
    recusado: "bg-destructive-soft text-destructive",
  };
  return (
    <span className={`inline-flex h-7 items-center rounded-full px-3 text-caption font-medium ${map[status]}`}>
      {t(`catalog.status.${status}`)}
    </span>
  );
}
