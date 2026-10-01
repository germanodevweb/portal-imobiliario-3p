/**
 * Grafo JSON-LD global: Organization + WebSite (@id fixos).
 * Referências: publisher / seller / isPartOf via @id.
 */

import { BASE_URL, SITE_NAME } from "@/lib/seo";
import {
  buildEmpresaPostalAddressJsonLd,
  EMPRESA_AREA_SERVED_CITIES,
  EMPRESA_GEO_COORDINATES,
  EMPRESA_OPENING_HOURS_SPEC,
  EMPRESA_POSTAL_ADDRESS,
} from "@/lib/constants/endereco-empresa";

/** Nome único da empresa em schemas (alinhado a SITE_NAME). */
export const SITE_ENTITY_ORGANIZATION_NAME = SITE_NAME;

/** Logo estável no domínio canônico (não usar URL do next/image). */
const SITE_LOGO_URL =
  "https://www.3pinheirosconsultoria.com.br/logo.png";

const TELEPHONE = "+55 85 98937-9295";

export const SITE_ENTITY_SAME_AS: readonly string[] = [
  "https://www.instagram.com/3pinheiros.consultoria/",
  "https://www.facebook.com/3pinheiros.Imobiliaria",
  "https://www.youtube.com/channel/UCkIM4QCicPoAd5muVQCm6Ig",
] as const;

export function organizationJsonLdId(): string {
  return `${BASE_URL}/#organization`;
}

export function websiteJsonLdId(): string {
  return `${BASE_URL}/#website`;
}

/** Referência à Organization no grafo global. */
export function jsonLdOrganizationRef(): { "@id": string } {
  return { "@id": organizationJsonLdId() };
}

/** Referência ao WebSite no grafo global. */
export function jsonLdWebsiteRef(): { "@id": string } {
  return { "@id": websiteJsonLdId() };
}

/**
 * Serialização segura para <script type="application/ld+json"> (evita quebra de tag).
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function buildOrganizationNode(): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": organizationJsonLdId(),
    name: SITE_ENTITY_ORGANIZATION_NAME,
    url: BASE_URL,
    logo: SITE_LOGO_URL,
    telephone: TELEPHONE,
    address: buildEmpresaPostalAddressJsonLd(),
    sameAs: [...SITE_ENTITY_SAME_AS],
  };
}

function buildWebsiteNode(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": websiteJsonLdId(),
    name: SITE_ENTITY_ORGANIZATION_NAME,
    url: BASE_URL,
    publisher: jsonLdOrganizationRef(),
    inLanguage: "pt-BR",
  };
}

/** Grafo único injetado no layout raiz. */
export function buildSiteEntityGraphJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [buildOrganizationNode(), buildWebsiteNode()],
  };
}

/** @deprecated Use buildSiteEntityGraphJsonLd */
export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    ...buildOrganizationNode(),
  };
}

function buildAreaServedJsonLd(): Record<string, unknown>[] {
  return EMPRESA_AREA_SERVED_CITIES.map((cityName) => ({
    "@type": "City",
    name: cityName,
    containedInPlace: {
      "@type": "State",
      name: "Ceará",
      containedInPlace: {
        "@type": "Country",
        name: "Brasil",
      },
    },
  }));
}

/** RealEstateAgent na home — mesmo @id da Organization (Google mescla por @id). */
export function buildHomeRealEstateAgentJsonLd(): Record<string, unknown> {
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": organizationJsonLdId(),
    name: SITE_ENTITY_ORGANIZATION_NAME,
    image: SITE_LOGO_URL,
    url: BASE_URL,
    telephone: TELEPHONE,
    address: buildEmpresaPostalAddressJsonLd(),
    areaServed: buildAreaServedJsonLd(),
    sameAs: [...SITE_ENTITY_SAME_AS],
  };

  if (EMPRESA_GEO_COORDINATES) {
    node.geo = {
      "@type": "GeoCoordinates",
      latitude: EMPRESA_GEO_COORDINATES.latitude,
      longitude: EMPRESA_GEO_COORDINATES.longitude,
    };
  }

  if (EMPRESA_OPENING_HOURS_SPEC.length > 0) {
    node.openingHoursSpecification = EMPRESA_OPENING_HOURS_SPEC;
  }

  return node;
}

export type CollectionPageJsonLdInput = {
  name: string;
  description: string;
  url: string;
  numberOfItems?: number;
  /** Ex.: página de cidade pai (opcional). */
  isPartOfUrl?: string;
};

export function buildCollectionPageJsonLd(
  input: CollectionPageJsonLdInput
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.numberOfItems !== undefined
      ? { numberOfItems: input.numberOfItems }
      : {}),
    isPartOf: input.isPartOfUrl
      ? { "@type": "WebPage", url: input.isPartOfUrl }
      : jsonLdWebsiteRef(),
    publisher: jsonLdOrganizationRef(),
  };
}

export type ItemListJsonLdEntry = {
  url: string;
  name?: string;
};

export function buildItemListJsonLd(input: {
  name: string;
  numberOfItems: number;
  items: ItemListJsonLdEntry[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    numberOfItems: input.numberOfItems,
    publisher: jsonLdOrganizationRef(),
    isPartOf: jsonLdWebsiteRef(),
    itemListElement: input.items.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: entry.url,
      ...(entry.name ? { name: entry.name } : {}),
    })),
  };
}

/** BreadcrumbList reutilizável. */
export function buildBreadcrumbListJsonLd(
  items: readonly { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Compatibilidade com imports antigos. */
export const SITE_ENTITY_LEGAL_NAME = SITE_ENTITY_ORGANIZATION_NAME;
