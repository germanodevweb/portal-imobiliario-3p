import { getPropertiesForMetaFeed } from "@/lib/queries/properties";
import { BASE_URL, SITE_NAME } from "@/lib/seo";
import {
  escapeXml,
  formatFeedPrice,
  buildFeedDescription,
  getFeedTypeName,
  xmlFeedResponse,
} from "@/lib/feed";
import { getWatermarkedImageUrl } from "@/lib/cloudinary/watermark";

// ISR: revalida o feed a cada 1 hora
export const revalidate = 3600;

export async function GET() {
  const properties = await getPropertiesForMetaFeed();

  const items = properties
    // Google Merchant rejeita itens sem image_link — filtra antes de construir o XML
    .filter((p) => Boolean(p.featuredImage))
    .map((p) => {
      const pageUrl = `${BASE_URL}/imoveis/${p.slug}`;
      const typeName = getFeedTypeName(p.propertyTypeSlug);
      const txLabel = p.transactionType === "SALE" ? "a venda" : "para alugar";
      const txCustom = p.transactionType === "SALE" ? "venda" : "aluguel";
      const availability = p.isSold ? "out of stock" : "in stock";

      const rawDescription =
        p.description ??
        buildFeedDescription({
          typeName,
          txLabel,
          city: p.city,
          neighborhood: p.neighborhood,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area: p.area,
        });

      // Google Merchant aceita descricoes de ate 5 000 caracteres
      const description = rawDescription.slice(0, 5000);

      // featuredImage ja foi confirmada como string pelo filtro acima
      const imageUrl = getWatermarkedImageUrl(p.featuredImage as string);

      const bedsLine =
        p.bedrooms > 0
          ? `\n      <g:custom_label_2>${p.bedrooms} quarto${p.bedrooms !== 1 ? "s" : ""}</g:custom_label_2>`
          : "";

      return `
    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:price>${formatFeedPrice(p.price)}</g:price>
      <g:link>${escapeXml(pageUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:brand>${escapeXml(SITE_NAME)}</g:brand>
      <g:product_type>${escapeXml(typeName)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:custom_label_0>${txCustom}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(p.citySlug)}</g:custom_label_1>${bedsLine}
    </item>`;
    })
    .join("");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    "  <channel>",
    `    <title>${escapeXml(SITE_NAME)}</title>`,
    `    <link>${BASE_URL}</link>`,
    `    <description>Google Merchant feed — ${escapeXml(SITE_NAME)} — CRECI 1317J</description>`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return xmlFeedResponse(xml);
}
