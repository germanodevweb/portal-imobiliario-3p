/**
 * Metragem de imóvel — faixa (areaMin/areaMax) com fallback no campo legado `area`.
 */

export type PropertyAreaFields = {
  area?: number | null;
  areaMin?: number | null;
  areaMax?: number | null;
};

export type ResolvedPropertyAreaBounds = {
  min: number | null;
  max: number | null;
};

export type PropertyAreaDisplay = {
  hasArea: boolean;
  /** Ex.: "48,95 m²" ou "de 48,95 m² a 120 m²" */
  line: string;
  /** Ex.: "48,95m²" ou "48,95 a 120m²" (feeds) */
  compact: string;
  /** Valor principal para destaque (página do imóvel) */
  headline: string;
};

function formatAreaNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Resolve limites efetivos (min/max) a partir dos campos do imóvel. */
export function resolvePropertyAreaBounds(
  fields: PropertyAreaFields
): ResolvedPropertyAreaBounds {
  const rawMin = fields.areaMin ?? null;
  const rawMax = fields.areaMax ?? null;

  if (rawMin != null || rawMax != null) {
    const min = rawMin ?? rawMax;
    const max = rawMax ?? rawMin;
    return { min, max };
  }

  if (fields.area != null && !Number.isNaN(Number(fields.area))) {
    return { min: Number(fields.area), max: Number(fields.area) };
  }

  return { min: null, max: null };
}

export function formatPropertyAreaDisplay(
  fields: PropertyAreaFields
): PropertyAreaDisplay {
  const { min, max } = resolvePropertyAreaBounds(fields);

  if (min == null || max == null) {
    return {
      hasArea: false,
      line: "— m²",
      compact: "",
      headline: "—",
    };
  }

  const minLabel = formatAreaNumber(min);
  const maxLabel = formatAreaNumber(max);

  if (min === max) {
    return {
      hasArea: true,
      line: `${minLabel} m²`,
      compact: `${minLabel}m²`,
      headline: `${minLabel} m²`,
    };
  }

  return {
    hasArea: true,
    line: `de ${minLabel} m² a ${maxLabel} m²`,
    compact: `${minLabel} a ${maxLabel}m²`,
    headline: `${minLabel} – ${maxLabel} m²`,
  };
}

export function propertyAreaFieldsFromNumbers(
  area: number | null | undefined,
  areaMin?: number | null,
  areaMax?: number | null
): PropertyAreaFields {
  return { area: area ?? null, areaMin: areaMin ?? null, areaMax: areaMax ?? null };
}

function parseOptionalAreaString(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

export type ParsedPropertyAreaForm =
  | {
      ok: true;
      areaMin: number | null;
      areaMax: number | null;
      /** Campo legado — min ?? max para compatibilidade */
      area: number | null;
    }
  | { ok: false; errors: Record<string, string> };

/** Valida área mínima/máxima do formulário admin. */
export function parsePropertyAreaFormInput(
  areaMinStr: string,
  areaMaxStr: string
): ParsedPropertyAreaForm {
  const errors: Record<string, string> = {};
  const areaMinRaw = areaMinStr.trim();
  const areaMaxRaw = areaMaxStr.trim();

  if (!areaMinRaw && !areaMaxRaw) {
    return { ok: true, areaMin: null, areaMax: null, area: null };
  }

  const areaMin = areaMinRaw ? parseOptionalAreaString(areaMinRaw) : null;
  const areaMax = areaMaxRaw ? parseOptionalAreaString(areaMaxRaw) : null;

  if (areaMinRaw && areaMin === null) {
    errors.areaMin = "Área mínima inválida";
  }
  if (areaMaxRaw && areaMax === null) {
    errors.areaMax = "Área máxima inválida";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const resolvedMin = areaMin ?? areaMax;
  const resolvedMax = areaMax ?? areaMin;

  if (resolvedMin != null && resolvedMax != null && resolvedMin > resolvedMax) {
    errors.areaMax = "Área máxima deve ser maior ou igual à mínima";
    return { ok: false, errors };
  }

  return {
    ok: true,
    areaMin: areaMin ?? areaMax,
    areaMax: areaMax ?? areaMin,
    area: resolvedMin ?? resolvedMax,
  };
}

/** JSON-LD floorSize (QuantitativeValue) quando houver metragem. */
export function buildPropertyAreaFloorSizeJsonLd(
  fields: PropertyAreaFields
): Record<string, unknown> | null {
  const { min, max } = resolvePropertyAreaBounds(fields);
  if (min == null || max == null) return null;

  if (min === max) {
    return {
      "@type": "QuantitativeValue",
      value: min,
      unitCode: "MTK",
    };
  }

  return {
    "@type": "QuantitativeValue",
    minValue: min,
    maxValue: max,
    unitCode: "MTK",
  };
}

/** Valores iniciais do formulário admin a partir do imóvel no banco. */
export function propertyAreaFormDefaults(fields: PropertyAreaFields): {
  areaMin: string;
  areaMax: string;
} {
  const { min, max } = resolvePropertyAreaBounds(fields);

  if (min == null) {
    return { areaMin: "", areaMax: "" };
  }

  if (max != null && min !== max) {
    return {
      areaMin: String(min),
      areaMax: String(max),
    };
  }

  return {
    areaMin: String(min),
    areaMax: "",
  };
}
