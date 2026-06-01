/**
 * JSON-LD global da empresa (Organization) e entidade local na home (RealEstateAgent).
 * Dados estáticos — sem I/O; seguro para layout e páginas server-side.
 */

import { BASE_URL } from "@/lib/seo";
import {
  buildEmpresaPostalAddressJsonLd,
  EMPRESA_POSTAL_ADDRESS,
} from "@/lib/constants/endereco-empresa";

/** Nome legal usado nos schemas (alinhado ao cadastro informado pelo cliente). */
export const SITE_ENTITY_LEGAL_NAME =
  "3 Pinheiros Consultoria Imobiliaria";

/** Logo estável no domínio canônico (não usar URL do next/image). */
const SITE_LOGO_URL =
  "https://www.3pinheirosconsultoria.com.br/logo.png";

const TELEPHONE = "+55 85 98937-9295";

export const SITE_ENTITY_SAME_AS: readonly string[] = [
  "https://www.instagram.com/3pinheiros.consultoria/",
  "https://www.facebook.com/3pinheiros.Imobiliaria",
  "https://www.youtube.com/channel/UCkIM4QCicPoAd5muVQCm6Ig",
] as const;

/**
 * Serialização segura para <script type="application/ld+json"> (evita quebra de tag).
 */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_ENTITY_LEGAL_NAME,
    url: BASE_URL,
    logo: SITE_LOGO_URL,
    telephone: TELEPHONE,
    address: buildEmpresaPostalAddressJsonLd(),
    sameAs: [...SITE_ENTITY_SAME_AS],
  };
}

export function buildHomeRealEstateAgentJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE_ENTITY_LEGAL_NAME,
    image: SITE_LOGO_URL,
    url: BASE_URL,
    telephone: TELEPHONE,
    address: buildEmpresaPostalAddressJsonLd(),
    areaServed: {
      "@type": "City",
      name: EMPRESA_POSTAL_ADDRESS.addressLocality,
      containedInPlace: {
        "@type": "State",
        name: "Ceará",
      },
    },
    sameAs: [...SITE_ENTITY_SAME_AS],
  };
}
