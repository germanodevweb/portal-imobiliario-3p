import type { PropertyFilters } from "@/lib/queries/properties";

/** Chave opcional `renda` na URL — só exibição; não entra no filtro Prisma. */
const RENDA_QUERY_ALLOWED = new Set(["3200", "5000", "9600", "13000"]);

export type ParsedImoveisSearchParams = {
  filters: PropertyFilters;
  rawCidade: string;
  rawBairro: string;
  rawTipo: string;
  rawQuartos: string;
  rawPrecoMin: string;
  rawPrecoMax: string;
  rawRenda: string;
  rawDestaque: boolean;
  rawLancamento: boolean;
  rawOportunidade: boolean;
  hasFilters: boolean;
};

export type ImoveisSearchParamsInput = {
  [key: string]: string | string[] | undefined;
};

/**
 * Sanitiza query string de /imoveis, /imoveis/alto-padrao e rotas de investimento (mesmos parâmetros).
 * Aceita `undefined` quando o caller ainda não tem `searchParams` (ex.: edge cases de render).
 */
export function parsePropertyListSearchParams(
  sp: ImoveisSearchParamsInput | undefined | null
): ParsedImoveisSearchParams {
  const q = sp ?? {};
  const rawCidade = typeof q.cidade === "string" ? q.cidade.trim() : "";
  const rawBairro = typeof q.bairro === "string" ? q.bairro.trim() : "";
  const rawTipo = typeof q.tipo === "string" ? q.tipo.trim() : "";
  const rawQuartos = typeof q.quartos === "string" ? q.quartos.trim() : "";
  const rawPrecoMin = typeof q.precoMin === "string" ? q.precoMin.trim() : "";
  const rawPrecoMax = typeof q.precoMax === "string" ? q.precoMax.trim() : "";
  const rawRendaRaw = typeof q.renda === "string" ? q.renda.trim() : "";
  const rawRenda = RENDA_QUERY_ALLOWED.has(rawRendaRaw) ? rawRendaRaw : "";
  const rawDestaque = q.destaque === "1" || q.destaque === "true";
  const rawLancamento = q.lancamento === "1" || q.lancamento === "true";
  const rawOportunidade = q.oportunidade === "1" || q.oportunidade === "true";

  const quartosParsed = parseInt(rawQuartos, 10);
  const bedroomsFilter =
    !isNaN(quartosParsed) && quartosParsed >= 1 && quartosParsed <= 10
      ? quartosParsed
      : undefined;

  const minPriceFilter =
    rawPrecoMin && /^\d+(\.\d+)?$/.test(rawPrecoMin) ? rawPrecoMin : undefined;
  const maxPriceFilter =
    rawPrecoMax && /^\d+(\.\d+)?$/.test(rawPrecoMax) ? rawPrecoMax : undefined;

  const filters: PropertyFilters = {
    ...(rawCidade ? { citySlug: rawCidade } : {}),
    ...(rawBairro ? { neighborhoodSlug: rawBairro } : {}),
    ...(rawTipo ? { propertyTypeSlug: rawTipo } : {}),
    ...(bedroomsFilter !== undefined ? { bedrooms: bedroomsFilter } : {}),
    ...(minPriceFilter ? { minPrice: minPriceFilter } : {}),
    ...(maxPriceFilter ? { maxPrice: maxPriceFilter } : {}),
    ...(rawDestaque ? { isFeatured: true } : {}),
    ...(rawLancamento ? { isLaunch: true } : {}),
    ...(rawOportunidade ? { isOpportunity: true } : {}),
  };

  const hasFilters = Boolean(
    rawCidade ||
      rawBairro ||
      rawTipo ||
      bedroomsFilter ||
      minPriceFilter ||
      maxPriceFilter ||
      rawDestaque ||
      rawLancamento ||
      rawOportunidade
  );

  return {
    filters,
    rawCidade,
    rawBairro,
    rawTipo,
    rawQuartos,
    rawPrecoMin,
    rawPrecoMax,
    rawRenda,
    rawDestaque,
    rawLancamento,
    rawOportunidade,
    hasFilters,
  };
}
