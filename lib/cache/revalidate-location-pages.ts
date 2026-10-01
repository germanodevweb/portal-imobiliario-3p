import { revalidatePath, revalidateTag } from "next/cache";

import { propertyDetailRevalidateTag } from "@/lib/queries/properties";

export type LocationRevalidationPlan = {
  citySlugs: string[];
  neighborhoodSlugs: string[];
  propertySlugs: string[];
  stateSlugs: string[];
};

function uniqueNonEmpty(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}

/** Invalida cache das rotas públicas afetadas por mudança de nome de exibição (slugs inalterados). */
export function revalidateLocationDisplayPages(
  plan: LocationRevalidationPlan
): void {
  const citySlugs = uniqueNonEmpty(plan.citySlugs);
  const neighborhoodSlugs = uniqueNonEmpty(plan.neighborhoodSlugs);
  const propertySlugs = uniqueNonEmpty(plan.propertySlugs);
  const stateSlugs = uniqueNonEmpty(plan.stateSlugs);

  revalidatePath("/");
  revalidatePath("/imoveis");

  for (const citySlug of citySlugs) {
    revalidatePath(`/cidade/${citySlug}`);
    for (const stateSlug of stateSlugs) {
      revalidatePath(`/estado/${stateSlug}/cidade/${citySlug}`);
    }
  }

  for (const neighborhoodSlug of neighborhoodSlugs) {
    revalidatePath(`/bairro/${neighborhoodSlug}`);
    for (const citySlug of citySlugs) {
      revalidatePath(`/cidade/${citySlug}/bairro/${neighborhoodSlug}`);
    }
  }

  for (const slug of propertySlugs) {
    revalidatePath(`/imoveis/${slug}`);
    revalidateTag(propertyDetailRevalidateTag(slug), "max");
  }

  revalidatePath("/sitemap.xml");
}
