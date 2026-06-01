/**
 * Depoimentos públicos do Google Business Profile (texto indexável na Home).
 * Mantenha alinhado ao perfil oficial; atualize contagem/nota quando mudar no Google.
 */

import { buildEmpresaMapsSearchQuery } from "@/lib/constants/endereco-empresa";

export const GOOGLE_BUSINESS_RATING = 5.0;
export const GOOGLE_BUSINESS_REVIEW_COUNT = 27;

export type GoogleReviewHighlight = {
  authorName: string;
  publishedAtLabel: string;
  publishedAtIso: string;
  body: string;
  avatarSrc: string;
  avatarAlt: string;
};

/** Imagem institucional da equipe no card de prova social (Home). */
export const INSTITUTIONAL_TEAM_IMAGE = {
  src: "/images/germano-fabio.png",
  alt: "Fábio Pinheiro e Germano Pinheiro, corretores e consultores imobiliários da 3 Pinheiros",
} as const;

/** Trechos reais exibidos no perfil Google (Home — prova social). */
export const GOOGLE_REVIEW_HIGHLIGHTS: readonly GoogleReviewHighlight[] = [
  {
    authorName: "Fábio Lima",
    publishedAtLabel: "31 de out. de 2024",
    publishedAtIso: "2024-10-31",
    body: "Uma imobiliária de confiança. O corretor Fábio mostra compromisso com o cliente e mostra tudo de forma correta e com transparência. Recomendo.",
    avatarSrc: "/images/fabio-lima.jpg",
    avatarAlt: "Foto de perfil de Fábio Lima, autor da avaliação no Google",
  },
  {
    authorName: "Natália Vieira",
    publishedAtLabel: "25 de set. de 2024",
    publishedAtIso: "2024-09-25",
    body: "O Fábio é um corretor incrível. Já tinha sido indicado pra mim por outros vizinhos meus. Atendimento impecável, sincero, que não mede esforços para encontrar o melhor imóvel pra você e sua família. Recomendo demais!",
    avatarSrc: "/images/natalia-vieira.jpg",
    avatarAlt: "Foto de perfil de Natália Vieira, autora da avaliação no Google",
  },
  {
    authorName: "Leonardo Silveira",
    publishedAtLabel: "12 de out. de 2024",
    publishedAtIso: "2024-10-12",
    body: "Muita atenção e profissionalismo, tivemos uma excelente assessoria na aquisição do imóvel. Agradeço ao Germano pelo atendimento.",
    avatarSrc: "/images/leonardo-silveira.jpg",
    avatarAlt: "Foto de perfil de Leonardo Silveira, autor da avaliação no Google",
  },
] as const;

/** URL das avaliações no Google (defina NEXT_PUBLIC_GOOGLE_REVIEWS_URL no .env quando tiver o link do perfil). */
export function resolveGoogleReviewsUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL?.trim();
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) {
    return fromEnv;
  }
  const query = encodeURIComponent(buildEmpresaMapsSearchQuery());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
