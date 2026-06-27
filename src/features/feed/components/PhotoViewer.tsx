import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoViewerProps {
  src: string;
  title?: string;
  onClose: () => void;
}

// Visualizador fullscreen estilo Apple Fotos:
// - fundo preto, imagem centralizada (object-contain)
// - arrastar para baixo fecha, com a imagem acompanhando o gesto
// - animação fluida de entrada/saída
export function PhotoViewer({ src, title, onClose }: PhotoViewerProps) {
  const [dragY, setDragY] = useState(0);
  const [closing, setClosing] = useState(false);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 200);
  }

  function onPointerDown(e: React.PointerEvent) {
    startY.current = e.clientY;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (startY.current === null) return;
    const dy = e.clientY - startY.current;
    if (dy > 0) setDragY(dy);
  }
  function onPointerUp() {
    if (dragY > 120) handleClose();
    else setDragY(0);
    startY.current = null;
  }

  // opacidade do fundo diminui conforme arrasta
  const bgOpacity = Math.max(0, 1 - dragY / 400);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex flex-col",
        closing ? "animate-[fade-in_0.2s_reverse]" : "animate-fade-in"
      )}
      style={{ backgroundColor: `rgba(0,0,0,${bgOpacity})` }}
    >
      {/* Topo */}
      <div className="flex items-center justify-between px-4 py-4 text-white">
        <button
          onClick={handleClose}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          aria-label="Fechar"
        >
          <X className="h-6 w-6" />
        </button>
        {title && <span className="truncate px-4 text-body font-medium">{title}</span>}
        <div className="h-10 w-10" />
      </div>

      {/* Imagem — acompanha o arrasto */}
      <div
        className="flex flex-1 touch-none items-center justify-center overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <img
          src={src}
          alt={title ?? ""}
          draggable={false}
          className="max-h-full max-w-full select-none object-contain transition-transform"
          style={{
            transform: `translateY(${dragY}px) scale(${1 - Math.min(dragY / 1600, 0.1)})`,
            transitionDuration: startY.current !== null ? "0ms" : "250ms",
          }}
        />
      </div>
    </div>
  );
}
