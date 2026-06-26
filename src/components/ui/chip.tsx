import { cn } from "@/lib/utils";

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ children, active, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3.5 text-caption font-medium transition-all active:scale-[0.97]",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border bg-background text-foreground hover:bg-surface",
        className
      )}
    >
      {children}
    </button>
  );
}
