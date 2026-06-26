// Tempo relativo curto e localizado (ex.: "agora", "2h", "3d").
export function timeAgo(iso: string, lang: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const w = Math.floor(d / 7);

  const now = lang === "en" ? "now" : "agora";
  if (s < 60) return now;
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (d < 7) return `${d}d`;
  return `${w}sem`.replace("sem", lang === "en" ? "w" : "sem");
}
