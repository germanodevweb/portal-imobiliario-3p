// ---------------------------------------------------------------------------
// Fundação SEO — funções puras e isomorphic
// Sem chamadas a banco. Podem ser usadas em generateMetadata() e Server Components.
// ---------------------------------------------------------------------------

export const SITE_NAME = "3Pinheiros Consultoria Imobiliária";

import { TITLE_BRAND_SUFFIX } from "@/lib/seo-meta";

export {
  TITLE_BRAND_SUFFIX,
  formatListingTransactionPhrase,
  getPropertyTypeSingular,
  buildPropertyPageTitle,
  buildPropertyPageDescription,
  buildHomePageTitle,
  buildImoveisPageTitle,
  buildImoveisFilteredTitle,
  buildStatePageTitle,
  buildStatePageDescription,
  buildStateCityPageTitle,
  buildStateCityPageDescription,
  buildCityPageTitle,
  buildCityPageDescription,
  buildNeighborhoodPageTitle,
  buildNeighborhoodPageDescription,
  buildNeighborhoodTypePageTitle,
  buildNeighborhoodTypePageDescription,
  buildPropertyTypeListTitle,
  buildPropertyTypeListDescription,
  buildPropertyTypePageTitle,
  buildPropertyTypePageDescription,
  buildCityNeighborhoodPageTitle,
  buildCityNeighborhoodPageDescription,
  buildBuyTypeCityPageTitle,
  buildBuyTypeCityPageDescription,
  buildBuyTypeCityNeighborhoodPageTitle,
  buildBuyTypeCityNeighborhoodPageDescription,
  buildBlogPostTitle,
} from "@/lib/seo-meta";

export type {
  PropertyMetaTitleInput,
  PropertyMetaDescriptionInput,
  TransactionType,
} from "@/lib/seo-meta";

export { formatPriceShort } from "@/lib/seo-primitives";
export type { PriceRange } from "@/lib/seo-primitives";

/** Domínio canônico oficial quando NEXT_PUBLIC_BASE_URL não está definida ou é inválida em produção. */
const DEFAULT_SITE_BASE_URL = "https://www.3pinheirosconsultoria.com.br";

/**
 * Origem fixa para `metadataBase` no `app/layout.tsx` (Next.js).
 * Deve coincidir com o domínio canônico oficial; URLs relativas em `metadata` resolvem-se contra ela.
 */
export const SITE_METADATA_BASE = new URL(DEFAULT_SITE_BASE_URL);

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

const REAL_ESTATE_LISTING_IMAGE_URL_MAX = 20;

/**
 * Meta description para a página inicial.
 */
export function buildHomePageDescription(): string {
  return `Encontre casas, apartamentos e imóveis comerciais em destaque. Atendimento personalizado para compra, venda e investimento. ${SITE_NAME}. CRECI 1317J.`;
}

/**
 * Meta description para listagem geral de imóveis (/imoveis sem filtros).
 */
export function buildImoveisPageDescription(count: number): string {
  const plural = count !== 1 ? "imóveis disponíveis" : "imóvel disponível";
  return `Encontre ${count} ${plural} com fotos, preços e detalhes completos. Casas, apartamentos, coberturas e terrenos. Consultoria especializada pela 3Pinheiros. CRECI 1317J.`;
}

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
 * Título para página de imóveis de alto padrão (acima de R$ 1,5 mi).
 * Usado em: /imoveis/alto-padrao
 */
export function buildAltoPadraoPageTitle(): string {
  return `Imóveis de Alto Padrão${TITLE_BRAND_SUFFIX}`;
}

/**
 * Meta description para página de alto padrão.
 */
export function buildAltoPadraoPageDescription(count: number): string {
  const plural = count !== 1 ? "imóveis exclusivos" : "imóvel exclusivo";
  return `Seleção de ${count} ${plural} acima de R$ 1,5 milhão. Localização nobre, sofisticação e imóveis de alto valor. Fale com um especialista 3Pinheiros. CRECI 1317J.`;
}

// ---------------------------------------------------------------------------
// URL canônica
// ---------------------------------------------------------------------------

/**
 * Monta URL canônica absoluta para uso em <link rel="canonical"> e og:url.
 * Usa `BASE_URL` (env + normalização); em produção alinha-se a `SITE_METADATA_BASE` quando a env aponta para o site oficial.
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
  lote: "Lotes",
  fazenda: "Fazendas",
  comercial: "Imóveis Comerciais",
  studio: "Studios",
};

export function getPropertyTypeLabel(slug: string): string {
  return PROPERTY_TYPE_LABELS[slug] ?? slug;
}

// ---------------------------------------------------------------------------
// Schema.org / JSON-LD — PostalAddress (SEO local)
// ---------------------------------------------------------------------------

/**
 * Campos opcionais de `PostalAddress` a partir do cadastro do imóvel.
 * - `postalCode`: só incluído quando preenchido (CEP).
 * - `addressCountry`: padrão `BR`; se houver país no banco, normaliza
 *   Brasil → ISO `BR`, siglas de 2 letras → maiúsculas, demais como texto (Schema.org aceita).
 * Não altera slugs, canonical nem arquitetura de URLs.
 */
export function jsonLdPostalAddressEnhancements(
  country: string | null | undefined,
  postalCode: string | null | undefined
): { postalCode?: string; addressCountry: string } {
  const postal = postalCode?.trim();
  const countryTrim = country?.trim();

  let addressCountry = "BR";
  if (countryTrim) {
    if (/^(br|brasil|brazil)$/i.test(countryTrim)) {
      addressCountry = "BR";
    } else if (/^[A-Za-z]{2}$/.test(countryTrim)) {
      addressCountry = countryTrim.toUpperCase();
    } else {
      addressCountry = countryTrim;
    }
  }

  return {
    ...(postal ? { postalCode: postal } : {}),
    addressCountry,
  };
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

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

/** Open Graph para página de exibição de vídeo (video.other + og:video). */
export function buildVideoWatchOpenGraph({
  title,
  description,
  url,
  thumbnailUrl,
  embedUrl,
}: {
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  embedUrl: string;
}) {
  return {
    title,
    description,
    url,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "video.other" as const,
    images: [{ url: thumbnailUrl, width: 1280, height: 720 }],
    videos: [{ url: embedUrl, width: 1280, height: 720 }],
  };
}

export {
  buildPropertyVideoWatchPageTitle,
  buildPropertyVideoWatchPagePath,
  buildPropertyVideoWatchCanonical,
  buildPropertyVideoObjectJsonLd,
  buildPropertyVideoWatchPagePlainDescription,
  resolvePropertyVideoSeo,
  buildYouTubeEmbedUrl,
  buildYouTubeWatchUrl,
} from "@/lib/seo-property-video";

export type {
  PropertyVideoSeoFields,
  ResolvedPropertyVideoSeo,
} from "@/lib/seo-property-video";

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
