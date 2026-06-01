import { prisma } from "@/lib/prisma";
import { hasNeighborhoodTable } from "@/lib/admin/schema-migration";
import {
  formatNeighborhoodDisplayName,
  normalizeNeighborhoodKey,
  slugifyNeighborhood,
} from "@/lib/utils/neighborhood-normalize";

export type ResolvedNeighborhood = {
  neighborhood: string | null;
  neighborhoodSlug: string | null;
};

function locationSlugs(city: string, state: string): { citySlug: string; stateSlug: string } {
  return {
    citySlug: slugifyNeighborhood(city),
    stateSlug: slugifyNeighborhood(state),
  };
}

/**
 * Resolve bairro ao salvar imóvel.
 * - Se existir no cadastro manual (/admin/bairros), reutiliza nome e slug canônicos.
 * - Caso contrário, apenas formata o texto digitado (não cria registro em Neighborhood).
 * - Imóveis já publicados só mudam quando forem editados e salvos.
 */
export async function resolveNeighborhoodForProperty(input: {
  neighborhood: string | null;
  city: string;
  state: string;
}): Promise<ResolvedNeighborhood> {
  const raw = input.neighborhood?.trim() ?? "";
  if (!raw) {
    return { neighborhood: null, neighborhoodSlug: null };
  }

  const city = input.city.trim();
  const state = input.state.trim();
  const { citySlug, stateSlug } = locationSlugs(city, state);
  const normalizedKey = normalizeNeighborhoodKey(raw);

  if (await hasNeighborhoodTable()) {
    const existingRegistry = await prisma.neighborhood.findUnique({
      where: {
        normalizedKey_citySlug_stateSlug: {
          normalizedKey,
          citySlug,
          stateSlug,
        },
      },
      select: { name: true, slug: true },
    });

    if (existingRegistry) {
      return {
        neighborhood: existingRegistry.name,
        neighborhoodSlug: existingRegistry.slug,
      };
    }
  }

  const formattedName = formatNeighborhoodDisplayName(raw);
  const slug = slugifyNeighborhood(formattedName);

  return {
    neighborhood: formattedName,
    neighborhoodSlug: slug,
  };
}
