import { PROPERTY_TYPE_LABELS } from "@/lib/seo";

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
  area: number | null;
}): string {
  const { typeName, txLabel, city, neighborhood, bedrooms, bathrooms, area } = opts;
  const location = neighborhood ? `${neighborhood}, ${city}` : city;
  const parts = [`${typeName} ${txLabel} em ${location}.`];
  if (bedrooms > 0) parts.push(`${bedrooms} quarto${bedrooms !== 1 ? "s" : ""}.`);
  if (bathrooms > 0) parts.push(`${bathrooms} banheiro${bathrooms !== 1 ? "s" : ""}.`);
  if (area) parts.push(`${area}m2.`);
  return parts.join(" ");
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
