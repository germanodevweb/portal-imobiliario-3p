/**
 * Formatação e conversão de moedas para a página de investimento internacional.
 * A conversão usa a cotação obtida de lib/services/exchange-rate.ts.
 */

export function brlToEur(priceBrl: number, eurToBrlRate: number): number {
  return priceBrl / eurToBrlRate;
}

export function formatPriceEur(value: number): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPriceBrl(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
