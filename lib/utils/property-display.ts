/** Texto curto para cards de imóvel (dormitórios / banheiros / área). */

export function dormLabel(bedrooms: number): string {
  return bedrooms === 1 ? "1 dorm." : `${bedrooms} dorms.`;
}

export function banhLabel(bathrooms: number): string {
  return bathrooms === 1 ? "1 banh." : `${bathrooms} banh.`;
}

/** Número da área em m² (pt-BR) ou "—" se não informada. */
export function formatPropertyAreaM2(area: number | null): string {
  if (area == null || Number.isNaN(Number(area))) return "—";
  const n = Number(area);
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Texto completo para o card: "1.234,56 m²" ou "— m²". */
export function formatPropertyAreaM2Line(area: number | null): string {
  return `${formatPropertyAreaM2(area)} m²`;
}
