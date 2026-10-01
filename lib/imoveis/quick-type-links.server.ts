import "server-only";

import { getAvailablePropertyTypes } from "@/lib/queries/properties";
import { getPropertyTypeLabel } from "@/lib/seo";

const QUICK_TYPE_SLUGS = ["casa", "apartamento", "terreno"] as const;

export type QuickPropertyTypeLink = {
  slug: string;
  label: string;
  href: string;
};

/** Atalhos da home/busca — só tipos com estoque publicado e URL indexável (/tipo/[slug]). */
export async function getQuickPropertyTypeLinks(): Promise<QuickPropertyTypeLink[]> {
  const available = new Set(
    (await getAvailablePropertyTypes()).map((t) => t.propertyTypeSlug)
  );

  return QUICK_TYPE_SLUGS.filter((slug) => available.has(slug)).map((slug) => ({
    slug,
    label: getPropertyTypeLabel(slug),
    href: `/tipo/${slug}`,
  }));
}
