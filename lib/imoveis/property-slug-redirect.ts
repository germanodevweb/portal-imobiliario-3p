import type { PropertySlugRedirectTarget } from "@/lib/queries/properties";

/** Destino 308 para imóvel despublicado: bairro preferencial, senão cidade. */
export function buildUnpublishedPropertyRedirectPath(
  target: PropertySlugRedirectTarget
): string {
  if (target.neighborhoodSlug) {
    return `/bairro/${target.neighborhoodSlug}`;
  }
  return `/cidade/${target.citySlug}`;
}
