/** Tipos e helpers compartilhados entre lib/seo.ts e lib/seo-meta.ts (evita ciclo). */

export type PriceRange = { minPrice: string; maxPrice: string } | null;

export function formatPriceShort(price: string): string {
  const n = Number(price);
  if (n >= 1_000_000) {
    const val = (n / 1_000_000).toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
    return `R$ ${val} mi`;
  }
  if (n >= 1_000) {
    return `R$ ${Math.round(n / 1_000)} mil`;
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);
}
