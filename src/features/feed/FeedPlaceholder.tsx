import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/api/auth.api";
import { APP_VERSION } from "@/lib/version";

// Home temporária. O Feed real (PostCard, infinite scroll) é a próxima entrega.
export function FeedPlaceholder() {
  const { t } = useTranslation();
  return (
    <div className="animate-fade-up">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-h1 text-foreground">{t("nav.feed")}</h1>
        <span className="text-caption text-muted-foreground">v{APP_VERSION}</span>
      </header>

      <EmptyState
        icon={Sparkles}
        title={t("app.name")}
        description={t("app.tagline")}
        action={
          <Button variant="outline" onClick={() => signOut()}>
            Sair
          </Button>
        }
      />
    </div>
  );
}
