/**
 * Preço de imóvel — "Sob Consulta" é apenas visual; no banco usa-se 0 quando não informado.
 */

export const PROPERTY_PRICE_ON_REQUEST_LABEL = "Sob Consulta";

export function hasPropertyListedPrice(
  price: string | number | null | undefined
): boolean {
  if (price === null || price === undefined) return false;

  const numeric =
    typeof price === "number" ? price : Number(String(price).trim());

  return Number.isFinite(numeric) && numeric > 0;
}

export function formatPropertyPriceBrl(
  price: string | number | null | undefined
): string {
  if (!hasPropertyListedPrice(price)) {
    return PROPERTY_PRICE_ON_REQUEST_LABEL;
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price));
}

export function formatPropertyPriceBrlCompact(
  price: string | number | null | undefined,
  options?: { maximumFractionDigits?: number }
): string {
  if (!hasPropertyListedPrice(price)) {
    return PROPERTY_PRICE_ON_REQUEST_LABEL;
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(Number(price));
}

export function validatePropertyPriceFormInput(
  priceStr: string
): { ok: true; price: number } | { ok: false; error: string } {
  const trimmed = priceStr.trim();

  if (!trimmed) {
    return { ok: true, price: 0 };
  }

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return {
      ok: false,
      error: "Informe um preço válido ou deixe vazio para Sob Consulta",
    };
  }

  return { ok: true, price: numeric };
}

export function propertyPriceFormDefaultValue(
  price: string | number | null | undefined
): string {
  return hasPropertyListedPrice(price) ? String(price) : "";
}
