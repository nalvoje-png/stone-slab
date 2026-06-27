// Converte código de país (ISO 3166-1 alpha-2) em emoji de bandeira e nome.
// Ex.: "BR" -> 🇧🇷 ; nome localizado simples.

export function flagEmoji(code: string | null | undefined): string {
  if (!code || code.length !== 2) return "";
  const A = 0x1f1e6;
  const up = code.toUpperCase();
  return String.fromCodePoint(A + (up.charCodeAt(0) - 65), A + (up.charCodeAt(1) - 65));
}

const NAMES_PT: Record<string, string> = {
  BR: "Brasil", IT: "Itália", US: "EUA", PT: "Portugal", ES: "Espanha",
  IN: "Índia", CN: "China", TR: "Turquia", EG: "Egito", GR: "Grécia",
};
const NAMES_EN: Record<string, string> = {
  BR: "Brazil", IT: "Italy", US: "USA", PT: "Portugal", ES: "Spain",
  IN: "India", CN: "China", TR: "Turkey", EG: "Egypt", GR: "Greece",
};

export function countryName(code: string | null | undefined, lang: string): string {
  if (!code) return "";
  const map = lang === "en" ? NAMES_EN : NAMES_PT;
  return map[code.toUpperCase()] ?? code.toUpperCase();
}
