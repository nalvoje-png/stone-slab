import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import iconUrl from "/logo-icon.png";

interface LogoProps {
  withText?: boolean;
  withTagline?: boolean;
  className?: string;
}

// Ícone real da marca (recortado do logo oficial).
export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={iconUrl}
      alt="Stone Slab"
      className={cn("rounded-[26%] object-contain", className)}
    />
  );
}

export function Logo({ withText = true, withTagline = false, className }: LogoProps) {
  const { t } = useTranslation();
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-8 w-8" />
      {withText && (
        <div className="leading-none">
          <span className="font-display text-xl font-600 tracking-tight text-foreground">
            {t("app.name")}
          </span>
          {withTagline && (
            <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              The Global Stone Network
            </span>
          )}
        </div>
      )}
    </div>
  );
}
