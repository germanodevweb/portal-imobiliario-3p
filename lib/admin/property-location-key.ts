import type { RegisteredCityOption } from "@/lib/admin/city-queries";
import { resolveCanonicalState, slugifyCity } from "@/lib/utils/city-normalize";

/**
 * Chave estável cidade+estado para filtrar bairros cadastrados no admin.
 * Alinha citySlug com cadastro canônico (City) quando disponível.
 */
export function buildPropertyLocationKey(input: {
  city: string;
  state: string;
  registeredCities?: RegisteredCityOption[];
}): string {
  const city = input.city.trim();
  const state = input.state.trim();
  if (!city || !state) return "";

  const { stateSlug } = resolveCanonicalState(state);
  if (!stateSlug) return "";

  const registeredCity = input.registeredCities?.find(
    (c) => c.name === city && c.stateSlug === stateSlug
  );
  const citySlug = registeredCity?.slug ?? slugifyCity(city);
  return `${citySlug}::${stateSlug}`;
}

/** URL do cadastro de bairro com cidade/estado pré-preenchidos. */
export function buildAdminNewNeighborhoodUrl(city: string, state: string): string {
  const params = new URLSearchParams();
  const cityTrimmed = city.trim();
  const stateTrimmed = state.trim();
  if (cityTrimmed) params.set("city", cityTrimmed);
  if (stateTrimmed) params.set("state", stateTrimmed);
  const qs = params.toString();
  return qs ? `/admin/bairros/novo?${qs}` : "/admin/bairros/novo";
}
