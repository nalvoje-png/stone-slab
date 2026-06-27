import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Drama } from "lucide-react";
import { useAccessStatus } from "../hooks/useAccessStatus";

// Item compacto "Showroom" para a linha de ações do post.
// Só aparece quando o usuário é parceiro APROVADO daquela empresa.
export function ShowroomAction({ companyId }: { companyId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isApproved } = useAccessStatus(companyId);

  if (!isApproved) return null;

  return (
    <button
      onClick={() => navigate(`/catalog/${companyId}`)}
      className="flex items-center gap-1.5 text-foreground transition-opacity hover:opacity-70"
      aria-label="Showroom"
    >
      <Drama className="h-[24px] w-[24px]" strokeWidth={1.7} />
      <span className="text-[14px] font-medium">{t("catalog.showroom")}</span>
    </button>
  );
}
