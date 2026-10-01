/**
 * Normalização de bairros — chave canônica para deduplicação.
 * "  Montése  " => key "montese" (sem acento, lowercase, espaços colapsados).
 */

import { collapseWhitespace } from "@/lib/utils/collapse-whitespace";

export { collapseWhitespace };

export function normalizeNeighborhoodKey(name: string): string {
  return collapseWhitespace(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function neighborhoodKeysMatch(a: string, b: string): boolean {
  return normalizeNeighborhoodKey(a) === normalizeNeighborhoodKey(b);
}

import { suggestNeighborhoodDisplayName } from "@/lib/utils/place-display-name";

/**
 * Formata nome para exibição ao cadastrar um bairro novo.
 */
export function formatNeighborhoodDisplayName(name: string): string {
  return suggestNeighborhoodDisplayName(name);
}

export function slugifyNeighborhood(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
