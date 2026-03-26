// ---------------------------------------------------------------------------
// Fundação SEO — funções puras e isomorphic
// Sem chamadas a banco. Podem ser usadas em generateMetadata() e Server Components.
// ---------------------------------------------------------------------------

export const SITE_NAME = "3Pinheiros Consultoria Imobiliária";

/** Domínio canônico oficial quando NEXT_PUBLIC_BASE_URL não está definida ou é inválida em produção. */
const DEFAULT_SITE_BASE_URL = "https://www.3pinheirosconsultoria.com.br";

/**
 * Em produção, substitui o domínio legado incorreto pelo canônico (evita SEO duplicado).
 */
function normalizeLegacyBaseUrlInProduction(base: string): string {
  if (process.env.NODE_ENV !== "production") return base;
  try {
    const u = new URL(base);
    const h = u.hostname.toLowerCase();
    if (h === "3pinheiros.com.br" || h === "www.3pinheiros.com.br") {
      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          "[lib/seo] NEXT_PUBLIC_BASE_URL usa domínio legado; normalizando para o canônico oficial."
        );
      }
      return DEFAULT_SITE_BASE_URL;
    }
  } catch {
    /* mantém base */
  }
  return base;
}

/**
 * Hosts que não devem aparecer em canonical/sitemap/feeds em produção.
 */
function isUnsafeBaseUrlForProduction(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    const h = hostname.toLowerCase();
    if (h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "0.0.0.0") {
      return true;
    }
    if (/^192\.168\.\d+\.\d+$/.test(h)) return true;
    if (/^10\.\d+\.\d+\.\d+$/.test(h)) return true;
    if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(h)) return true;
    return false;
  } catch {
    return true;
  }
}

/**
 * URL absoluta do site (https, sem barra final).
 * Usada em: canonical, Open Graph, sitemap, robots, feeds e hreflang.
 *
 * **Produção:** defina `NEXT_PUBLIC_BASE_URL` no host (ex.: Vercel) como
 * `https://www.3pinheirosconsultoria.com.br`. Sem isso, usa `DEFAULT_SITE_BASE_URL`.
 *
 * **Desenvolvimento:** opcionalmente `http://localhost:3000` para testar URLs locais.
 */
function resolveSiteBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  let base = raw?.replace(/\/+$/, "") ?? "";

  if (!base) {
    return DEFAULT_SITE_BASE_URL;
  }

  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base.replace(/^\/+/, "")}`;
  }

  base = normalizeLegacyBaseUrlInProduction(base);

  if (process.env.NODE_ENV === "production" && isUnsafeBaseUrlForProduction(base)) {
    if (typeof console !== "undefined" && console.warn) {
      console.warn(
        "[lib/seo] NEXT_PUBLIC_BASE_URL aponta para localhost ou rede local em produção; usando DEFAULT_SITE_BASE_URL."
      );
    }
    return DEFAULT_SITE_BASE_URL;
  }

  return base;
}

export const BASE_URL = resolveSiteBaseUrl();

// ---------------------------------------------------------------------------
// Títulos
// ---------------------------------------------------------------------------

/**
 * Título para página de estado.
 * Ex: "Imóveis à Venda em São Paulo | 3Pinheiros"
 * Usado em: /estado/[stateSlug]
 */
export function buildStatePageTitle(state: string): string {
  return `Imóveis à Venda em ${state} | ${SITE_NAME}`;
}

/**
 * Meta description para página de estado.
 * Inclui contagem e número de cidades para sinalizar cobertura real ao Google.
 */
export function buildStatePageDescription(
  state: string,
  count: number,
  cityCount: number
): string {
  const plural = count !== 1 ? "imóveis disponíveis" : "imóvel disponível";
  const cityStr =
    cityCount > 1
      ? ` Cobertura em ${cityCount} cidades do estado.`
      : cityCount === 1
        ? " Cobertura em 1 cidade do estado."
        : "";
  return `Encontre ${count} ${plural} em ${state}.${cityStr} Casas, apartamentos e terrenos à venda. Consultoria especializada pela 3Pinheiros. CRECI 1317J.`;
}

/**
 * Título para página de cidade no contexto de estado.
 * Framing distinto de /cidade/[slug] para evitar duplicate content.
 * Ex: "São Paulo em São Paulo: Imóveis à Venda | 3Pinheiros"
 * Usado em: /estado/[stateSlug]/cidade/[citySlug]
 */
export function buildStateCityPageTitle(city: string, state: string): string {
  return `${city} em ${state}: Imóveis à Venda | ${SITE_NAME}`;
}

/**
 * Meta description para página de cidade no contexto de estado.
 * Enfatiza cobertura de bairros e relação com o estado para diferenciação semântica.
 */
export function buildStateCityPageDescription(
  city: string,
  state: string,
  count: number,
  neighborhoodCount: number
): string {
  const plural = count !== 1 ? "imóveis publicados" : "imóvel publicado";
  const bairroStr =
    neighborhoodCount > 1
      ? ` Cobertura em ${neighborhoodCount} bairros de ${city}.`
      : neighborhoodCount === 1
        ? ` Cobertura em 1 bairro de ${city}.`
        : "";
  return `${count} ${plural} em ${city}, estado de ${state}.${bairroStr} Compare casas, apartamentos e terrenos com consultoria especializada. 3Pinheiros CRECI 1317J.`;
}

/**
 * Título para a página inicial (/).
 */
export function buildHomePageTitle(): string {
  return `Imóveis e Consultoria Imobiliária | ${SITE_NAME}`;
}

/**
 * Meta description para a página inicial.
 */
export function buildHomePageDescription(): string {
  return `Encontre casas, apartamentos e imóveis comerciais em destaque. Atendimento personalizado para compra, venda e investimento. ${SITE_NAME}. CRECI 1317J.`;
}

/**
 * Título para a listagem geral de imóveis (/imoveis sem filtros).
 */
export function buildImoveisPageTitle(): string {
  return `Imóveis à Venda | ${SITE_NAME}`;
}

/**
 * Título para /imoveis com filtros ativos (página noindex).
 * Compõe de forma dinâmica com base nos filtros presentes.
 */
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
  if (bedrooms) parts.push(`${bedrooms >= 4 ? "4+" : bedrooms} quarto${bedrooms !== 1 ? "s" : ""}`);
  const prefix = parts.length > 0 ? parts.join(" ") : "Imóveis";
  return `${prefix} | ${SITE_NAME}`;
}

/**
 * Meta description para listagem geral de imóveis (/imoveis sem filtros).
 */
export function buildImoveisPageDescription(count: number): string {
  const plural = count !== 1 ? "imóveis disponíveis" : "imóvel disponível";
  return `Encontre ${count} ${plural} com fotos, preços e detalhes completos. Casas, apartamentos, coberturas e terrenos. Consultoria especializada pela 3Pinheiros. CRECI 1317J.`;
}

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
 * Título para página de bairro segmentada por tipo.
 * Ex: "Apartamentos à Venda no Vila Madalena, São Paulo | 3Pinheiros"
 * Usado em: /bairro/[slug]/tipo/[typeSlug]
 */
export function buildNeighborhoodTypePageTitle(
  typeName: string,
  neighborhood: string,
  city: string
): string {
  return `${typeName} à Venda no ${neighborhood}, ${city} | ${SITE_NAME}`;
}

/**
 * Meta description para página de bairro+tipo.
 * Inclui contagem real para sinalizar conteúdo relevante ao Google.
 */
export function buildNeighborhoodTypePageDescription(
  typeName: string,
  neighborhood: string,
  city: string,
  count: number
): string {
  const plural = count !== 1 ? "imóveis" : "imóvel";
  return `${count} ${plural} do tipo ${typeName.toLowerCase()} no ${neighborhood}, ${city}. Veja fotos, preços e detalhes completos. Consultoria especializada pela 3Pinheiros. CRECI 1317J.`;
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

const REAL_ESTATE_LISTING_IMAGE_URL_MAX = 20;

/**
 * URLs para o campo `image` do JSON-LD RealEstateListing (Thing.image).
 * Alinhado à UI de app/imoveis/[slug]: hero (featuredImage) primeiro, depois
 * galeria — mesma fonte que a galeria (PropertyImage ou galleryImages).
 * Sem duplicatas nem strings vazias.
 */
export function buildRealEstateListingImageUrls(property: {
  featuredImage: string | null;
  galleryImages: string[];
  images: readonly { url: string }[];
}): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const push = (raw: string | null | undefined) => {
    const u = raw?.trim();
    if (!u || seen.has(u)) return;
    seen.add(u);
    out.push(u);
  };

  push(property.featuredImage);

  if (property.images.length > 0) {
    for (const img of property.images) {
      push(img.url);
      if (out.length >= REAL_ESTATE_LISTING_IMAGE_URL_MAX) break;
    }
  } else {
    for (const url of property.galleryImages) {
      push(url);
      if (out.length >= REAL_ESTATE_LISTING_IMAGE_URL_MAX) break;
    }
  }

  return out;
}

/**
 * Título para listagem geral de um tipo de imóvel.
 * Ex: "Apartamentos à Venda | 3Pinheiros Consultoria Imobiliária"
 */
export function buildPropertyTypeListTitle(typeName: string): string {
  return `${typeName} à Venda | ${SITE_NAME}`;
}

/**
 * Título para página de imóveis de alto padrão (acima de R$ 1,5 mi).
 * Usado em: /imoveis/alto-padrao
 */
export function buildAltoPadraoPageTitle(): string {
  return `Imóveis de Alto Padrão | ${SITE_NAME}`;
}

/**
 * Meta description para página de alto padrão.
 */
export function buildAltoPadraoPageDescription(count: number): string {
  const plural = count !== 1 ? "apartamentos exclusivos" : "apartamento exclusivo";
  return `Seleção de ${count} ${plural} acima de R$ 1,5 milhão. Localização nobre, sofisticação e imóveis de alto valor. Fale com um especialista 3Pinheiros. CRECI 1317J.`;
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
 * Título para página de intenção comercial: comprar tipo em cidade.
 * Ex: "Comprar Apartamentos em São Paulo | 3Pinheiros"
 * Usado em: /comprar/[typeSlug]/[citySlug]
 */
export function buildBuyTypeCityPageTitle(typeName: string, city: string): string {
  return `Comprar ${typeName} em ${city} | ${SITE_NAME}`;
}

/**
 * Meta description para página comprar tipo em cidade.
 */
export function buildBuyTypeCityPageDescription(
  typeName: string,
  city: string,
  count: number
): string {
  const plural = count !== 1 ? "imóveis" : "imóvel";
  return `${count} ${plural} do tipo ${typeName.toLowerCase()} à venda em ${city}. Veja fotos, preços e detalhes. Consultoria especializada pela 3Pinheiros. CRECI 1317J.`;
}

/**
 * Título para página de intenção comercial: comprar tipo em bairro.
 * Ex: "Comprar Apartamentos no Vila Madalena, São Paulo | 3Pinheiros"
 * Usado em: /comprar/[typeSlug]/[citySlug]/[neighborhoodSlug]
 */
export function buildBuyTypeCityNeighborhoodPageTitle(
  typeName: string,
  neighborhood: string,
  city: string
): string {
  return `Comprar ${typeName} no ${neighborhood}, ${city} | ${SITE_NAME}`;
}

/**
 * Meta description para página comprar tipo em bairro.
 */
export function buildBuyTypeCityNeighborhoodPageDescription(
  typeName: string,
  neighborhood: string,
  city: string,
  count: number
): string {
  const plural = count !== 1 ? "imóveis" : "imóvel";
  return `${count} ${plural} do tipo ${typeName.toLowerCase()} à venda no ${neighborhood}, ${city}. Veja fotos, preços e detalhes. Consultoria especializada pela 3Pinheiros. CRECI 1317J.`;
}

/**
 * Título para página de bairro em contexto de cidade.
 * Framing distinto de buildNeighborhoodPageTitle para evitar duplicate content:
 *   /bairro/[slug]                    → "Imóveis à Venda no {neighborhood}, {city}"
 *   /cidade/[citySlug]/bairro/[slug]  → "Bairro {neighborhood} em {city} — Imóveis"
 * Usado em: /cidade/[citySlug]/bairro/[slug]
 */
export function buildCityNeighborhoodPageTitle(
  neighborhood: string,
  city: string
): string {
  return `Bairro ${neighborhood} em ${city} — Imóveis à Venda | ${SITE_NAME}`;
}

/**
 * Meta description para bairro em contexto de cidade.
 * Enfatiza a relação com a cidade e a navegação entre bairros.
 */
export function buildCityNeighborhoodPageDescription(
  neighborhood: string,
  city: string,
  count: number,
  neighborhoodCount: number
): string {
  const plural = count !== 1 ? "imóveis disponíveis" : "imóvel disponível";
  const nbContext =
    neighborhoodCount > 1
      ? ` ${city} conta com ${neighborhoodCount} bairros no portal.`
      : "";
  return `${count} ${plural} no ${neighborhood}, um dos bairros de ${city}.${nbContext} Veja fotos, preços e detalhes. Consultoria especializada pela 3Pinheiros. CRECI 1317J.`;
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
// Formatação de preço — versão curta para blocos de dados nas páginas
// ---------------------------------------------------------------------------

/**
 * Formata um preço em string para exibição compacta.
 * Ex: "350000"  → "R$ 350 mil"
 * Ex: "1250000" → "R$ 1,2 mi"
 */
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
// Blog
// ---------------------------------------------------------------------------

/**
 * Titulo para pagina de post individual.
 * Ex: "Como financiar seu primeiro imovel | 3Pinheiros"
 */
export function buildBlogPostTitle(title: string): string {
  return `${title} | ${SITE_NAME}`;
}

/**
 * Meta description para post individual.
 * Usa o excerpt cadastrado ou gera um fallback neutro.
 */
export function buildBlogPostDescription(
  title: string,
  excerpt: string | null
): string {
  return (
    excerpt ??
    `Leia o artigo "${title}" no blog da ${SITE_NAME}. Dicas e informacoes sobre o mercado imobiliario.`
  );
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
