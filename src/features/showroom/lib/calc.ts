// Cálculos do estoque do Showroom.
// A indústria mede em metros; o sistema deriva m², pé² e valores.

export const SQM_TO_SQFT = 10.7639; // 1 m² = 10,7639 pé²

export function areaSqm(lengthM: number, heightM: number): number {
  return +(lengthM * heightM).toFixed(3);
}
export function sqmToSqft(sqm: number): number {
  return +(sqm * SQM_TO_SQFT).toFixed(3);
}
export function pricePerSqmToSqft(pricePerSqm: number): number {
  return +(pricePerSqm / SQM_TO_SQFT).toFixed(2);
}
export function pricePerSqftToSqm(pricePerSqft: number): number {
  return +(pricePerSqft * SQM_TO_SQFT).toFixed(2);
}
export function slabValue(sqm: number, pricePerSqm: number | null): number | null {
  if (pricePerSqm == null) return null;
  return +(sqm * pricePerSqm).toFixed(2);
}
export function usd(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
export function fmtSqm(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${v.toFixed(2).replace(".", ",")} m²`;
}
export function fmtSqft(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${v.toFixed(2)} ft²`;
}
