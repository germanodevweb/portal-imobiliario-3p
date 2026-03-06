import { getPropertiesForMetaFeed } from "@/lib/queries/properties";
import { BASE_URL, SITE_NAME, PROPERTY_TYPE_LABELS } from "@/lib/seo";

// ISR: revalida o feed a cada 1 hora
export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escapa os cinco caracteres especiais do XML. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Formata o preco no padrao exigido pelo Meta Catalog: "500000.00 BRL"
 * Meta rejeita o separador de milhar e qualquer simbolo de moeda.
 */
function formatPrice(price: string): string {
  return `${Number(price).toFixed(2)} BRL`;
}

/**
 * Gera uma descricao de fallback quando o imovel nao possui descricao cadastrada.
 * Mantida curta e factual para nao gerar conteudo de baixa qualidade no catalogo.
 */
function buildFallbackDescription(opts: {
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

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function GET() {
  const properties = await getPropertiesForMetaFeed();

  const items = properties
    // Meta rejeita itens sem image_link — filtra antes de construir o XML
    .filter((p) => Boolean(p.featuredImage))
    .map((p) => {
      const pageUrl = `${BASE_URL}/imoveis/${p.slug}`;
      const typeName = PROPERTY_TYPE_LABELS[p.propertyTypeSlug] ?? p.propertyTypeSlug;
      const txLabel = p.transactionType === "SALE" ? "a venda" : "para alugar";
      const txCustom = p.transactionType === "SALE" ? "venda" : "aluguel";
      const availability = p.isSold ? "out of stock" : "in stock";

      const rawDescription =
        p.description ??
        buildFallbackDescription({
          typeName,
          txLabel,
          city: p.city,
          neighborhood: p.neighborhood,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area: p.area,
        });

      // Meta aceita descricoes de ate 9 999 caracteres; limitamos a 5 000 por seguranca
      const description = rawDescription.slice(0, 5000);

      // featuredImage ja foi confirmada como string pelo filtro acima
      const imageUrl = p.featuredImage as string;

      const bedsLine =
        p.bedrooms > 0
          ? `\n      <g:custom_label_2>${p.bedrooms} quarto${p.bedrooms !== 1 ? "s" : ""}</g:custom_label_2>`
          : "";

      return `
    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(p.title)}</g:title>
      <g:description>${esc(description)}</g:description>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:price>${formatPrice(p.price)}</g:price>
      <g:link>${esc(pageUrl)}</g:link>
      <g:image_link>${esc(imageUrl)}</g:image_link>
      <g:brand>${esc(SITE_NAME)}</g:brand>
      <g:product_type>${esc(typeName)}</g:product_type>
      <g:custom_label_0>${txCustom}</g:custom_label_0>
      <g:custom_label_1>${esc(p.citySlug)}</g:custom_label_1>${bedsLine}
    </item>`;
    })
    .join("");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    "  <channel>",
    `    <title>${esc(SITE_NAME)}</title>`,
    `    <link>${BASE_URL}</link>`,
    `    <description>Catalogo de imoveis — ${esc(SITE_NAME)} — CRECI 1317J</description>`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Cache publico: CDN mantem por 1h, stale-while-revalidate por ate 24h
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
