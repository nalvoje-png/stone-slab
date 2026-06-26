import { useTranslation } from "react-i18next";
import { Badge } from "./badge";

export type Availability = "disponivel" | "reservado" | "vendido";

const map = {
  disponivel: "success",
  reservado: "warning",
  vendido: "destructive",
} as const;

export function AvailabilityBadge({ status }: { status: Availability }) {
  const { t } = useTranslation();
  return (
    <Badge variant={map[status]} dot>
      {t(`availability.${status}`)}
    </Badge>
  );
}
