import { useTranslation } from "react-i18next";
import { Mountain, Factory, Hammer, Store, Compass, PenTool, ShoppingBag, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/types/database";

const TYPES: { value: AccountType; Icon: typeof Mountain }[] = [
  { value: "pedreira", Icon: Mountain },
  { value: "serraria", Icon: Hammer },
  { value: "industria", Icon: Factory },
  { value: "marmoraria", Icon: Store },
  { value: "arquiteto", Icon: Compass },
  { value: "designer", Icon: PenTool },
  { value: "comprador", Icon: ShoppingBag },
  { value: "distribuidor", Icon: Truck },
];

interface Props {
  value: AccountType | null;
  onChange: (value: AccountType) => void;
}

export function AccountTypePicker({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {TYPES.map(({ value: type, Icon }) => {
        const selected = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all",
              selected
                ? "border-primary bg-accent ring-1 ring-primary"
                : "border-border hover:border-primary/40 hover:bg-secondary"
            )}
          >
            <Icon className={cn("h-5 w-5", selected ? "text-primary" : "text-muted-foreground")} />
            <span className="text-sm font-medium">{t(`accountType.${type}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
