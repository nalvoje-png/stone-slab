import { useEffect, useRef } from "react";

// Observa um elemento sentinela e dispara onLoadMore quando ele entra na viewport.
export function useInfiniteScroll(
  onLoadMore: () => void,
  enabled: boolean
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const obs = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && onLoadMore(),
      { rootMargin: "600px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onLoadMore, enabled]);

  return ref;
}
