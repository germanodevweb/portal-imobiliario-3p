import { PROPERTY_TYPE_LABELS } from "@/lib/seo";
import { formatPropertyAreaDisplay, type PropertyAreaFields } from "@/lib/utils/property-area";
import { htmlToPlainText } from "@/lib/utils/html-to-plain-text";

// ---------------------------------------------------------------------------
// Helpers compartilhados entre os feeds Meta e Google Merchant.
// Sem acesso a banco. Funcoes puras e isomorphic.
// ---------------------------------------------------------------------------

/**
 * Escapa os cinco caracteres especiais do XML.
 * Aplicar em todo valor dinamico antes de inserir no markup.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Formata o preco no padrao exigido por Meta e Google Merchant: "500000.00 BRL"
 * Ambas as plataformas rejeitam separador de milhar e simbolo de moeda.
 */
export function formatFeedPrice(price: string): string {
  return `${Number(price).toFixed(2)} BRL`;
}

/**
 * Retorna o label de exibicao do tipo de imovel a partir do propertyTypeSlug.
 * Usa a mesma tabela PROPERTY_TYPE_LABELS de lib/seo.ts — fonte unica de verdade.
 */
export function getFeedTypeName(propertyTypeSlug: string): string {
  return PROPERTY_TYPE_LABELS[propertyTypeSlug] ?? propertyTypeSlug;
}

/**
 * Gera uma descricao de fallback quando o imovel nao possui descricao cadastrada.
 * Mantida curta e factual para nao gerar conteudo de baixa qualidade no catalogo.
 */
export function buildFeedDescription(opts: {
  typeName: string;
  txLabel: string;
  city: string;
  neighborhood: string | null;
  bedrooms: number;
  bathrooms: number;
} & PropertyAreaFields): string {
  const { typeName, txLabel, city, neighborhood, bedrooms, bathrooms, area, areaMin, areaMax } =
    opts;
  const location = neighborhood ? `${neighborhood}, ${city}` : city;
  const parts = [`${typeName} ${txLabel} em ${location}.`];
  if (bedrooms > 0) parts.push(`${bedrooms} quarto${bedrooms !== 1 ? "s" : ""}.`);
  if (bathrooms > 0) parts.push(`${bathrooms} banheiro${bathrooms !== 1 ? "s" : ""}.`);
  const areaDisplay = formatPropertyAreaDisplay({ area, areaMin, areaMax });
  if (areaDisplay.hasArea) parts.push(`${areaDisplay.compact}.`);
  return parts.join(" ");
}

/** Descrição indexável nos feeds: HTML convertido em texto; fallback factual. */
export function resolveFeedPlainDescription(
  descriptionHtml: string | null,
  fallback: {
    typeName: string;
    txLabel: string;
    city: string;
    neighborhood: string | null;
    bedrooms: number;
    bathrooms: number;
  } & PropertyAreaFields,
  maxLength = 5000
): string {
  if (descriptionHtml?.trim()) {
    const plain = htmlToPlainText(descriptionHtml, maxLength);
    if (plain.trim()) return plain;
  }
  return buildFeedDescription(fallback).slice(0, maxLength);
}

/** Resumo curto para anúncios dinâmicos Google Ads Imóveis (limite de exibição ~25 caracteres). */
export function buildGoogleAdsRealEstateShortDescription(
  opts: {
    bedrooms: number;
    bathrooms: number;
  } & PropertyAreaFields
): string {
  const parts: string[] = [];
  if (opts.bedrooms > 0) {
    parts.push(`${opts.bedrooms} quarto${opts.bedrooms !== 1 ? "s" : ""}`);
  }
  if (opts.bathrooms > 0) {
    parts.push(`${opts.bathrooms} banh.`);
  }
  const areaDisplay = formatPropertyAreaDisplay(opts);
  if (areaDisplay.hasArea) parts.push(areaDisplay.compact);
  const line = parts.join(", ");
  return line.length > 25 ? `${line.slice(0, 22)}…` : line;
}

export function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Cria a Response padrao para feeds XML com cache publico.
 * Ambos os feeds usam Content-Type e Cache-Control identicos.
 */
export function xmlFeedResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // CDN mantem por 1h; stale-while-revalidate serve cache antigo por ate 24h
      // enquanto o proximo ciclo ISR regenera em background.
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

export function csvFeedResponse(csv: string): Response {
  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
