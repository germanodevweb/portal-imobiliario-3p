import type { Prisma } from "@/lib/generated/prisma/client";

export const PROPERTY_SEARCH_MIN_LENGTH = 2;
export const PROPERTY_SEARCH_MAX_LENGTH = 120;

/** Normaliza termo digitado na busca (trim + limite de tamanho). */
export function sanitizePropertySearchQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, PROPERTY_SEARCH_MAX_LENGTH);
}

export function isValidPropertySearchQuery(raw: string): boolean {
  return sanitizePropertySearchQuery(raw).length >= PROPERTY_SEARCH_MIN_LENGTH;
}

/**
 * WHERE Prisma para imóveis publicados cujo título, slug, cidade, bairro ou
 * construtora contenham o termo (case-insensitive).
 */
export function buildPublishedPropertyTextSearchWhere(
  rawQuery: string
): Prisma.PropertyWhereInput | undefined {
  const query = sanitizePropertySearchQuery(rawQuery);
  if (query.length < PROPERTY_SEARCH_MIN_LENGTH) return undefined;

  return {
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
      { neighborhood: { contains: query, mode: "insensitive" } },
      { builderName: { contains: query, mode: "insensitive" } },
    ],
  };
}
