/**
 * Builders de title/description otimizados para CTR (Parte 5).
 * Funções puras — importadas por lib/seo.ts.
 */

import { collapseWhitespace } from "@/lib/utils/collapse-whitespace";
import {
  formatPropertyAreaDisplay,
  type PropertyAreaFields,
} from "@/lib/utils/property-area";
import {
  formatPropertyPriceBrlCompact,
  hasPropertyListedPrice,
} from "@/lib/utils/property-price";
import { formatPriceShort, type PriceRange } from "@/lib/seo-primitives";

export { formatPriceShort };
export type { PriceRange };

export const TITLE_BRAND_SUFFIX = " | 3Pinheiros";
const META_TITLE_MAX_LEN = 60;
const META_DESC_MIN = 140;
const META_DESC_MAX = 160;

const AREA_TYPE_SLUGS = new Set(["terreno", "lote", "fazenda"]);

export const PROPERTY_TYPE_SINGULAR: Record<string, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  cobertura: "Cobertura",
  terreno: "Terreno",
  lote: "Lote",
  fazenda: "Fazenda",
  comercial: "Imóvel comercial",
  studio: "Studio",
};

export function getPropertyTypeSingular(slug: string): string {
  return PROPERTY_TYPE_SINGULAR[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

export type TransactionType = "SALE" | "RENT";

export function formatListingTransactionPhrase(
  types: readonly TransactionType[]
): string {
  const hasSale = types.includes("SALE");
  const hasRent = types.includes("RENT");
  if (hasSale && hasRent) return "à Venda e para Alugar";
  if (hasRent) return "para Alugar";
  return "à Venda";
}

export function formatListingTransactionPhraseDescription(
  types: readonly TransactionType[]
): string {
  const hasSale = types.includes("SALE");
  const hasRent = types.includes("RENT");
  if (hasSale && hasRent) return "à venda e para alugar";
  if (hasRent) return "para alugar";
  return "à venda";
}

function withTitleBrand(core: string): string {
  return `${core}${TITLE_BRAND_SUFFIX}`;
}

function pickFirstFittingTitle(candidates: string[]): string {
  for (const core of candidates) {
    const full = withTitleBrand(core);
    if (full.length <= META_TITLE_MAX_LEN) return full;
  }
  const last = candidates[candidates.length - 1] ?? "Imóvel";
  const maxCore = META_TITLE_MAX_LEN - TITLE_BRAND_SUFFIX.length;
  let trimmed = last;
  while (trimmed.length > maxCore && trimmed.includes(" ")) {
    trimmed = trimmed.replace(/\s+\S+$/, "").trim();
  }
  if (trimmed.length > maxCore) {
    trimmed = trimmed.slice(0, maxCore).trim();
  }
  return withTitleBrand(trimmed);
}

function transactionVerb(type: TransactionType): string {
  return type === "RENT" ? "para alugar" : "à venda";
}

function bedroomSegment(bedrooms: number, propertyTypeSlug: string): string {
  if (propertyTypeSlug === "studio") return "studio";
  if (bedrooms <= 0) return "";
  const n = bedrooms >= 4 ? "4+" : String(bedrooms);
  return `${n} quarto${bedrooms === 1 ? "" : "s"}`;
}

function areaSegment(fields: PropertyAreaFields): string {
  const display = formatPropertyAreaDisplay(fields);
  if (!display.hasArea) return "";
  const compact = display.compact.replace(/m²/g, " m²");
  return compact.includes("m²") ? compact : `${compact} m²`;
}

export type PropertyMetaTitleInput = PropertyAreaFields & {
  propertyTypeSlug: string;
  transactionType: TransactionType;
  bedrooms: number;
  neighborhood: string | null;
  city: string;
};

export function buildPropertyPageTitle(input: PropertyMetaTitleInput): string {
  const tipo = getPropertyTypeSingular(input.propertyTypeSlug);
  const verb = transactionVerb(input.transactionType);
  const useArea = AREA_TYPE_SLUGS.has(input.propertyTypeSlug);
  const spec = useArea
    ? areaSegment(input)
    : bedroomSegment(input.bedrooms, input.propertyTypeSlug);

  const specPart = spec ? ` ${spec}` : "";
  const bairro = input.neighborhood?.trim();
  const cidade = input.city.trim();

  const candidates: string[] = [];
  if (bairro && cidade) {
    candidates.push(`${tipo}${specPart} ${verb} em ${bairro}, ${cidade}`);
  }
  if (cidade) {
    candidates.push(`${tipo}${specPart} ${verb} em ${cidade}`);
  }
  candidates.push(`${tipo}${specPart} ${verb}`);

  return pickFirstFittingTitle(candidates);
}

function formatPriceRangePhrase(range: PriceRange | null | undefined): string {
  if (!range) return "consulte valores";
  const min = formatPriceShort(range.minPrice);
  const max = formatPriceShort(range.maxPrice);
  if (min === max) return `a partir de ${min}`;
  return `de ${min} a ${max}`;
}

function fitMetaDescription(text: string): string {
  let t = collapseWhitespace(text);
  if (t.length > META_DESC_MAX) {
    t = t.slice(0, META_DESC_MAX - 1).trimEnd() + "…";
  }
  if (t.length < META_DESC_MIN && !/CRECI/i.test(t)) {
    t = `${t} CRECI 1317J.`.slice(0, META_DESC_MAX);
  }
  return t;
}

export type PropertyMetaDescriptionInput = PropertyMetaTitleInput & {
  price: string | number | null | undefined;
};

export function buildPropertyPageDescription(
  input: PropertyMetaDescriptionInput
): string {
  const useArea = AREA_TYPE_SLUGS.has(input.propertyTypeSlug);
  const spec = useArea
    ? areaSegment(input)
    : bedroomSegment(input.bedrooms, input.propertyTypeSlug);
  const verb = transactionVerb(input.transactionType);
  const tipo = getPropertyTypeSingular(input.propertyTypeSlug).toLowerCase();
  const locParts = [input.neighborhood?.trim(), input.city.trim()].filter(Boolean);
  const loc = locParts.join(", ");
  const price = hasPropertyListedPrice(input.price)
    ? formatPropertyPriceBrlCompact(input.price)
    : "sob consulta";

  const lead = spec
    ? `${spec.charAt(0).toUpperCase() + spec.slice(1)}, ${tipo} ${verb}.`
    : `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${verb}.`;

  const raw = `${lead} ${loc}. ${price}. Fotos e detalhes completos. Fale com a 3Pinheiros.`;
  return fitMetaDescription(raw);
}

function listingCountLabel(count: number): string {
  return count !== 1 ? `${count} imóveis` : "1 imóvel";
}

export function buildCityPageTitle(
  city: string,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const phrase = formatListingTransactionPhrase(transactionTypes);
  return withTitleBrand(`Imóveis ${phrase} em ${city}`);
}

export function buildCityPageDescription(
  city: string,
  count: number,
  priceRange: PriceRange | null | undefined,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const tx = formatListingTransactionPhraseDescription(transactionTypes);
  const prices = formatPriceRangePhrase(priceRange);
  const raw = `${listingCountLabel(count)} ${tx} em ${city}. Valores ${prices}. Fotos, filtros e consultoria imobiliária. CRECI 1317J.`;
  return fitMetaDescription(raw);
}

export function buildNeighborhoodPageTitle(
  neighborhood: string,
  city: string,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const phrase = formatListingTransactionPhrase(transactionTypes);
  return withTitleBrand(`Imóveis ${phrase} em ${neighborhood}, ${city}`);
}

export function buildNeighborhoodPageDescription(
  neighborhood: string,
  city: string,
  count: number,
  priceRange: PriceRange | null | undefined,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const tx = formatListingTransactionPhraseDescription(transactionTypes);
  const prices = formatPriceRangePhrase(priceRange);
  const raw = `${listingCountLabel(count)} ${tx} em ${neighborhood}, ${city}. Preços ${prices}. Veja fotos e localização. 3Pinheiros. CRECI 1317J.`;
  return fitMetaDescription(raw);
}

export function buildPropertyTypeListTitle(
  typeName: string,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const phrase = formatListingTransactionPhrase(transactionTypes);
  return withTitleBrand(`${typeName} ${phrase}`);
}

export function buildPropertyTypeListDescription(
  typeName: string,
  count: number,
  priceRange: PriceRange | null | undefined,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const tx = formatListingTransactionPhraseDescription(transactionTypes);
  const prices = formatPriceRangePhrase(priceRange);
  const typeLower = typeName.toLowerCase();
  const raw = `${listingCountLabel(count)} (${typeLower}) ${tx}. Faixa ${prices}. Fotos e detalhes. Consultoria 3Pinheiros. CRECI 1317J.`;
  return fitMetaDescription(raw);
}

export function buildStatePageTitle(
  state: string,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const phrase = formatListingTransactionPhrase(transactionTypes);
  return withTitleBrand(`Imóveis ${phrase} em ${state}`);
}

export function buildStatePageDescription(
  state: string,
  count: number,
  cityCount: number,
  priceRange: PriceRange | null | undefined,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const tx = formatListingTransactionPhraseDescription(transactionTypes);
  const prices = formatPriceRangePhrase(priceRange);
  const cityStr =
    cityCount > 1
      ? ` em ${cityCount} cidades`
      : cityCount === 1
        ? " em 1 cidade"
        : "";
  const raw = `${listingCountLabel(count)} ${tx} no ${state}${cityStr}. Valores ${prices}. Casas, aptos e terrenos. 3Pinheiros. CRECI 1317J.`;
  return fitMetaDescription(raw);
}

export function buildNeighborhoodTypePageTitle(
  typeName: string,
  neighborhood: string,
  city: string,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const phrase = formatListingTransactionPhrase(transactionTypes);
  return withTitleBrand(`${typeName} ${phrase} em ${neighborhood}, ${city}`);
}

export function buildNeighborhoodTypePageDescription(
  typeName: string,
  neighborhood: string,
  city: string,
  count: number,
  priceRange: PriceRange | null | undefined,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const tx = formatListingTransactionPhraseDescription(transactionTypes);
  const prices = formatPriceRangePhrase(priceRange);
  const typeLower = typeName.toLowerCase();
  const raw = `${count} ${typeLower} ${tx} em ${neighborhood}, ${city}. Preços ${prices}. Fotos e detalhes. 3Pinheiros. CRECI 1317J.`;
  return fitMetaDescription(raw);
}

export function buildPropertyTypePageTitle(
  typeName: string,
  city: string,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const phrase = formatListingTransactionPhrase(transactionTypes);
  return withTitleBrand(`${typeName} ${phrase} em ${city}`);
}

export function buildPropertyTypePageDescription(
  typeName: string,
  city: string,
  count: number,
  priceRange: PriceRange | null | undefined,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const tx = formatListingTransactionPhraseDescription(transactionTypes);
  const prices = formatPriceRangePhrase(priceRange);
  const typeLower = typeName.toLowerCase();
  const raw = `${listingCountLabel(count)} (${typeLower}) ${tx} em ${city}. Faixa ${prices}. Fotos e filtros. 3Pinheiros. CRECI 1317J.`;
  return fitMetaDescription(raw);
}

export function buildStateCityPageTitle(
  city: string,
  state: string,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const phrase = formatListingTransactionPhrase(transactionTypes);
  return withTitleBrand(`${city}, ${state}: imóveis ${phrase}`);
}

export function buildStateCityPageDescription(
  city: string,
  state: string,
  count: number,
  neighborhoodCount: number,
  priceRange: PriceRange | null | undefined,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const tx = formatListingTransactionPhraseDescription(transactionTypes);
  const prices = formatPriceRangePhrase(priceRange);
  const bairroStr =
    neighborhoodCount > 1
      ? ` ${neighborhoodCount} bairros.`
      : neighborhoodCount === 1
        ? " 1 bairro."
        : "";
  const raw = `${listingCountLabel(count)} ${tx} em ${city} (${state}).${bairroStr} Valores ${prices}. Consultoria 3Pinheiros. CRECI 1317J.`;
  return fitMetaDescription(raw);
}

export function buildCityNeighborhoodPageTitle(
  neighborhood: string,
  city: string,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const phrase = formatListingTransactionPhrase(transactionTypes);
  return withTitleBrand(`${neighborhood}, ${city}: imóveis ${phrase}`);
}

export function buildCityNeighborhoodPageDescription(
  neighborhood: string,
  city: string,
  count: number,
  neighborhoodCount: number,
  priceRange: PriceRange | null | undefined,
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const tx = formatListingTransactionPhraseDescription(transactionTypes);
  const prices = formatPriceRangePhrase(priceRange);
  const nbContext =
    neighborhoodCount > 1
      ? ` ${city} tem ${neighborhoodCount} bairros no portal.`
      : "";
  const raw = `${listingCountLabel(count)} ${tx} em ${neighborhood}, ${city}.${nbContext} Preços ${prices}. 3Pinheiros. CRECI 1317J.`;
  return fitMetaDescription(raw);
}

export function buildBuyTypeCityNeighborhoodPageTitle(
  typeName: string,
  neighborhood: string,
  city: string
): string {
  return withTitleBrand(`Comprar ${typeName} em ${neighborhood}, ${city}`);
}

export function buildBuyTypeCityNeighborhoodPageDescription(
  typeName: string,
  neighborhood: string,
  city: string,
  count: number,
  priceRange: PriceRange | null | undefined
): string {
  const prices = formatPriceRangePhrase(priceRange);
  const typeLower = typeName.toLowerCase();
  const raw = `${count} ${typeLower} à venda em ${neighborhood}, ${city}. Faixa ${prices}. Fotos e detalhes. 3Pinheiros. CRECI 1317J.`;
  return fitMetaDescription(raw);
}

export function buildBuyTypeCityPageTitle(typeName: string, city: string): string {
  return withTitleBrand(`Comprar ${typeName} em ${city}`);
}

export function buildBuyTypeCityPageDescription(
  typeName: string,
  city: string,
  count: number,
  priceRange: PriceRange | null | undefined
): string {
  const prices = formatPriceRangePhrase(priceRange);
  const typeLower = typeName.toLowerCase();
  const raw = `${count} ${typeLower} à venda em ${city}. Valores ${prices}. Fotos e consultoria. 3Pinheiros. CRECI 1317J.`;
  return fitMetaDescription(raw);
}

export function buildHomePageTitle(): string {
  return withTitleBrand("Imóveis e consultoria imobiliária");
}

export function buildImoveisPageTitle(
  transactionTypes: readonly TransactionType[] = ["SALE"]
): string {
  const phrase = formatListingTransactionPhrase(transactionTypes);
  return withTitleBrand(`Imóveis ${phrase}`);
}

export function buildImoveisFilteredTitle({
  typeName,
  city,
  bedrooms,
}: {
  typeName?: string;
  city?: string;
  bedrooms?: number;
}): string {
  const parts: string[] = [];
  if (typeName) parts.push(typeName);
  if (city) parts.push(`em ${city}`);
  if (bedrooms) {
    parts.push(`${bedrooms >= 4 ? "4+" : bedrooms} quarto${bedrooms !== 1 ? "s" : ""}`);
  }
  const prefix = parts.length > 0 ? parts.join(" ") : "Imóveis";
  return withTitleBrand(prefix);
}

export function buildBlogPostTitle(title: string): string {
  return withTitleBrand(title);
}
