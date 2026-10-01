/** Dígitos inteiros para comparação Prisma (campo Decimal). */
function digitsOnly(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  return digits.length > 0 ? digits : undefined;
}

function swapIfInverted(min: string | undefined, max: string | undefined): {
  min: string | undefined;
  max: string | undefined;
} {
  if (!min || !max) return { min, max };
  if (BigInt(min) > BigInt(max)) return { min: max, max: min };
  return { min, max };
}

export type ResolvedPriceFilter = {
  minPrice?: string;
  maxPrice?: string;
};

/** Alinha min/max da URL (troca se min > max). */
export function resolvePriceFilterPair(
  minPrice: string,
  maxPrice: string
): ResolvedPriceFilter {
  const minDigits = digitsOnly(minPrice);
  const maxDigits = digitsOnly(maxPrice);
  const { min, max } = swapIfInverted(minDigits, maxDigits);
  return {
    ...(min ? { minPrice: min } : {}),
    ...(max ? { maxPrice: max } : {}),
  };
}

export type PriceWhereBounds = { gte?: string; lte?: string };

/**
 * Monta `price: { gte, lte }` para listagem geral (/imoveis).
 * Sem piso de catálogo — só aplica o que o usuário informou.
 */
export function buildOpenPriceWhere(filters: {
  minPrice?: string;
  maxPrice?: string;
}): PriceWhereBounds | undefined {
  const { min, max } = swapIfInverted(
    digitsOnly(filters.minPrice),
    digitsOnly(filters.maxPrice)
  );
  if (!min && !max) return undefined;

  const gte = min;
  let lte = max;
  if (gte && lte && BigInt(gte) > BigInt(lte)) {
    lte = undefined;
  }

  return {
    ...(gte ? { gte } : {}),
    ...(lte ? { lte } : {}),
  };
}

/**
 * Vitrines com piso fixo (investimento, alto padrão): `gte` nunca abaixo do catálogo.
 * Se o teto for menor que o piso efetivo, o teto é ignorado (evita 0 resultados silenciosos).
 */
export function buildCatalogMinPriceWhere(
  filters: { minPrice?: string; maxPrice?: string },
  catalogMinPrice: string
): { gte: string; lte?: string } {
  const floor = digitsOnly(catalogMinPrice) ?? catalogMinPrice;
  const { min, max } = swapIfInverted(
    digitsOnly(filters.minPrice),
    digitsOnly(filters.maxPrice)
  );

  let gte = min;
  if (!gte || BigInt(gte) < BigInt(floor)) {
    gte = floor;
  }

  let lte = max;
  if (lte && BigInt(lte) < BigInt(gte)) {
    lte = undefined;
  }

  return {
    gte,
    ...(lte ? { lte } : {}),
  };
}
