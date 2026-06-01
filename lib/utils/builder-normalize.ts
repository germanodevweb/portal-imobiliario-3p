/**
 * Normalização de construtoras — chave canônica para deduplicação.
 * "  Moura Dubeux  " => key "moura dubeux"
 */

export function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function normalizeBuilderKey(name: string): string {
  return collapseWhitespace(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function builderKeysMatch(a: string, b: string): boolean {
  return normalizeBuilderKey(a) === normalizeBuilderKey(b);
}

export function formatBuilderDisplayName(name: string): string {
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

export function slugifyBuilder(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
