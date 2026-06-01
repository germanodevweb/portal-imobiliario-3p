import { prisma } from "@/lib/prisma";
import { hasCityTable } from "@/lib/admin/schema-migration";
import {
  formatCityDisplayName,
  parseCityInput,
  resolveCanonicalState,
  slugifyCity,
} from "@/lib/utils/city-normalize";

export type ResolvedCity = {
  city: string;
  citySlug: string;
  state: string;
  stateSlug: string;
};

/**
 * Resolve cidade ao salvar imóvel.
 * - Se existir no cadastro canônico (/admin/cidades), reutiliza nome e slug oficiais.
 * - Caso contrário, normaliza o texto digitado (não cria registro em City).
 */
export async function resolveCityForProperty(input: {
  city: string;
  state: string;
}): Promise<ResolvedCity> {
  const cityRaw = input.city.trim();
  const stateRaw = input.state.trim();

  const { cityName, normalizedKey } = parseCityInput(cityRaw);
  const { state, stateSlug } = resolveCanonicalState(stateRaw);

  if (!cityName || !normalizedKey || !state || !stateSlug) {
    return {
      city: formatCityDisplayName(cityRaw) || cityRaw,
      citySlug: slugifyCity(cityRaw),
      state: state || stateRaw,
      stateSlug: stateSlug || slugifyCity(stateRaw),
    };
  }

  if (await hasCityTable()) {
    const existingRegistry = await prisma.city.findUnique({
      where: {
        normalizedKey_stateSlug: {
          normalizedKey,
          stateSlug,
        },
      },
      select: { name: true, slug: true, state: true, stateSlug: true },
    });

    if (existingRegistry) {
      return {
        city: existingRegistry.name,
        citySlug: existingRegistry.slug,
        state: existingRegistry.state,
        stateSlug: existingRegistry.stateSlug,
      };
    }
  }

  return {
    city: cityName,
    citySlug: slugifyCity(cityName),
    state,
    stateSlug,
  };
}
