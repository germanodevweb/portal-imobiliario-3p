/**
 * Vitrine da Home (/) — imóveis publicados a partir deste valor.
 * Valor em reais inteiros (string), compatível com o campo `price` do Prisma.
 *
 * Altere apenas aqui para mudar o piso da listagem principal.
 */
export const HOME_LISTING_MIN_PRICE = "600000" as const;

/** Valor numérico para formatação e comparações em UI. */
export const HOME_LISTING_MIN_PRICE_BRL = 600_000;

export function formatHomeListingMinPriceLabel(): string {
  return HOME_LISTING_MIN_PRICE_BRL.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}
