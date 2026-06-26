import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage;

  return (
    <div className="inline-flex items-center rounded-full border bg-secondary p-0.5 text-xs font-medium">
      {(["pt", "en"] as const).map((lng) => (
        <button
          key={lng}
          onClick={() => i18n.changeLanguage(lng)}
          className={cn(
            "rounded-full px-3 py-1 transition-colors",
            current === lng
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
