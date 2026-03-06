// ---------------------------------------------------------------------------
// Fundação SEO — funções puras e isomorphic
// Sem chamadas a banco. Podem ser usadas em generateMetadata() e Server Components.
// ---------------------------------------------------------------------------

export const SITE_NAME = "3Pinheiros Consultoria Imobiliária";
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://3pinheiros.com.br";

// ---------------------------------------------------------------------------
// Títulos
// ---------------------------------------------------------------------------

/**
 * Título para página de listagem por cidade.
 * Ex: "Imóveis à Venda em São Paulo | 3Pinheiros"
 */
export function buildCityPageTitle(city: string): string {
  return `Imóveis à Venda em ${city} | ${SITE_NAME}`;
}

/**
 * Título para página de bairro.
 * Ex: "Imóveis à Venda no Vila Madalena, São Paulo | 3Pinheiros"
 */
export function buildNeighborhoodPageTitle(
  neighborhood: string,
  city: string
): string {
  return `Imóveis à Venda no ${neighborhood}, ${city} | ${SITE_NAME}`;
}

/**
 * Título para página individual de imóvel.
 * Ex: "Casa à Venda na Vila Madalena — 3 quartos | 3Pinheiros"
 */
export function buildPropertyPageTitle(
  title: string,
  city: string
): string {
  return `${title} — ${city} | ${SITE_NAME}`;
}

/**
 * Título para listagem geral de um tipo de imóvel.
 * Ex: "Apartamentos à Venda | 3Pinheiros Consultoria Imobiliária"
 */
export function buildPropertyTypeListTitle(typeName: string): string {
  return `${typeName} à Venda | ${SITE_NAME}`;
}

/**
 * Título para página de tipo de imóvel segmentada por cidade.
 * Ex: "Apartamentos à Venda em São Paulo | 3Pinheiros"
 * Reservado para futura rota /tipo/[typeSlug]/cidade/[citySlug].
 */
export function buildPropertyTypePageTitle(
  typeName: string,
  city: string
): string {
  return `${typeName} à Venda em ${city} | ${SITE_NAME}`;
}

// ---------------------------------------------------------------------------
// Descrições
// ---------------------------------------------------------------------------

/**
 * Meta description para página de cidade.
 * Inclui contagem para sinalizar conteúdo relevante ao Google.
 */
export function buildCityPageDescription(
  city: string,
  count: number
): string {
  const plural = count !== 1 ? "imóveis disponíveis" : "imóvel disponível";
  return `Encontre ${count} ${plural} em ${city}. Casas, apartamentos e coberturas à venda e para locação. Consultoria completa pela 3Pinheiros.`;
}

/**
 * Meta description para listagem geral de um tipo de imóvel.
 * Inclui contagem para sinalizar conteúdo real ao Google.
 */
export function buildPropertyTypeListDescription(
  typeName: string,
  count: number
): string {
  const plural = count !== 1 ? "imóveis" : "imóvel";
  return `${count} ${plural} do tipo ${typeName.toLowerCase()} disponíveis com fotos, preços e detalhes. Consultoria especializada pela 3Pinheiros. CRECI 1317J.`;
}

/**
 * Meta description para página de tipo segmentada por cidade.
 * Usado em: /tipo/[typeSlug]/cidade/[citySlug]
 */
export function buildPropertyTypePageDescription(
  typeName: string,
  city: string,
  count: number
): string {
  const plural = count !== 1 ? "imóveis" : "imóvel";
  return `${count} ${plural} do tipo ${typeName.toLowerCase()} disponíveis em ${city}. Veja fotos, preços e detalhes completos. Consultoria especializada pela 3Pinheiros. CRECI 1317J.`;
}

/**
 * Meta description para página de bairro.
 */
export function buildNeighborhoodPageDescription(
  neighborhood: string,
  city: string,
  count: number
): string {
  const plural = count !== 1 ? "imóveis" : "imóvel";
  return `${count} ${plural} no ${neighborhood}, ${city}. Veja opções de casas e apartamentos com fotos, preços e localização. 3Pinheiros.`;
}

/**
 * Meta description para imóvel individual.
 */
export function buildPropertyPageDescription(
  title: string,
  city: string,
  bedrooms: number,
  price: string
): string {
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(price));

  return `${title} em ${city}. ${bedrooms} quarto${bedrooms !== 1 ? "s" : ""}. ${formattedPrice}. Consulte condições com a 3Pinheiros Consultoria Imobiliária.`;
}

// ---------------------------------------------------------------------------
// URL canônica
// ---------------------------------------------------------------------------

/**
 * Monta URL canônica absoluta para uso em <link rel="canonical"> e og:url.
 * Ex: buildCanonicalUrl("/imoveis/casa-vila-madalena-sp")
 */
export function buildCanonicalUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
}

// ---------------------------------------------------------------------------
// Tipos de imóvel — mapeamento slug → label de exibição
// ---------------------------------------------------------------------------

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  casa: "Casas",
  apartamento: "Apartamentos",
  cobertura: "Coberturas",
  terreno: "Terrenos",
  comercial: "Imóveis Comerciais",
  studio: "Studios",
};

export function getPropertyTypeLabel(slug: string): string {
  return PROPERTY_TYPE_LABELS[slug] ?? slug;
}

// ---------------------------------------------------------------------------
// Open Graph
// ---------------------------------------------------------------------------

/**
 * Objeto base de Open Graph reutilizável para generateMetadata().
 */
export function buildOpenGraph({
  title,
  description,
  url,
  image,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
}) {
  return {
    title,
    description,
    url,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website" as const,
    ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
  };
}

/**
 * Twitter card reutilizável para generateMetadata().
 * Usa summary_large_image para preview com imagem grande.
 */
export function buildTwitterCard({ title, description, image }: {
  title: string;
  description: string;
  image?: string;
}) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    ...(image ? { images: [image] } : {}),
  };
}
