import { normalizePriceQueryParam } from "@/lib/imoveis/normalize-price-param";
import { resolvePriceFilterPair } from "@/lib/imoveis/resolve-price-filter";

/** Monta URLSearchParams a partir do formulário GET de filtros de imóveis. */
export function readImoveisFilterFormParams(form: HTMLFormElement): URLSearchParams {
  const params = new URLSearchParams();
  const fieldNames = [
    "cidade",
    "bairro",
    "tipo",
    "quartos",
    "precoMin",
    "precoMax",
    "renda",
    "busca",
  ] as const;

  for (const name of fieldNames) {
    const value = form.elements.namedItem(name);
    if (!(value instanceof HTMLInputElement || value instanceof HTMLSelectElement)) continue;
    const trimmed = value.value.trim();
    if (trimmed) params.set(name, trimmed);
  }

  const minRaw = params.get("precoMin") ?? "";
  const maxRaw = params.get("precoMax") ?? "";
  params.delete("precoMin");
  params.delete("precoMax");
  const normalizedMin = normalizePriceQueryParam(minRaw);
  const normalizedMax = normalizePriceQueryParam(maxRaw);
  const { minPrice, maxPrice } = resolvePriceFilterPair(normalizedMin, normalizedMax);
  if (minPrice) params.set("precoMin", minPrice);
  if (maxPrice) params.set("precoMax", maxPrice);

  return params;
}

export function applyBadgeParams(
  params: URLSearchParams,
  badges: { destaque: boolean; lancamento: boolean; oportunidade: boolean }
): URLSearchParams {
  if (badges.destaque) params.set("destaque", "1");
  else params.delete("destaque");
  if (badges.lancamento) params.set("lancamento", "1");
  else params.delete("lancamento");
  if (badges.oportunidade) params.set("oportunidade", "1");
  else params.delete("oportunidade");
  return params;
}

export function buildImoveisListUrl(
  listPath: string,
  params: URLSearchParams
): string {
  const qs = params.toString();
  return qs ? `${listPath}?${qs}` : listPath;
}
