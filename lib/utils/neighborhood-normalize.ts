/**
 * Normalização de bairros — chave canônica para deduplicação.
 * "  Montése  " => key "montese" (sem acento, lowercase, espaços colapsados).
 */

export function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function normalizeNeighborhoodKey(name: string): string {
  return collapseWhitespace(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function neighborhoodKeysMatch(a: string, b: string): boolean {
  return normalizeNeighborhoodKey(a) === normalizeNeighborhoodKey(b);
}

/**
 * Formata nome para exibição ao cadastrar um bairro novo.
 * Preserva acentos digitados; aplica capitalização por palavra.
 */
export function formatNeighborhoodDisplayName(name: string): string {
  const collapsed = collapseWhitespace(name);
  if (!collapsed) return collapsed;

  return collapsed
    .split(" ")
    .map((word) => {
      if (!word) return word;
      const lower = word.toLocaleLowerCase("pt-BR");
      return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
    })
    .join(" ");
}

export function slugifyNeighborhood(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
