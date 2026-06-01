/** Texto curto para cards de imóvel (dormitórios / banheiros / área). */

import {
  formatPropertyAreaDisplay,
  type PropertyAreaFields,
} from "@/lib/utils/property-area";

/** Tipos em que o card mostra só a área (sem dorms/banh.). */
const PROPERTY_TYPES_AREA_ONLY = new Set(["fazenda", "lote", "terreno"]);

export function isPropertyTypeAreaOnly(propertyTypeSlug: string): boolean {
  return PROPERTY_TYPES_AREA_ONLY.has(propertyTypeSlug.trim().toLowerCase());
}

export function dormLabel(bedrooms: number): string {
  return bedrooms === 1 ? "1 dorm." : `${bedrooms} dorms.`;
}

export function banhLabel(bathrooms: number): string {
  return bathrooms === 1 ? "1 banh." : `${bathrooms} banh.`;
}

export type { PropertyAreaFields };

function toAreaFields(input: PropertyAreaFields | number | null | undefined): PropertyAreaFields {
  if (input === null || input === undefined) {
    return { area: null };
  }
  if (typeof input === "number") {
    return { area: input };
  }
  return input;
}

/** Número da área em m² (pt-BR) ou "—" se não informada (valor único legado). */
export function formatPropertyAreaM2(area: number | null): string {
  if (area == null || Number.isNaN(Number(area))) return "—";
  const n = Number(area);
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Texto completo para cards: "48,95 m²" ou "de 48,95 m² a 120 m²". */
export function formatPropertyAreaM2Line(
  input: PropertyAreaFields | number | null | undefined
): string {
  return formatPropertyAreaDisplay(toAreaFields(input)).line;
}
