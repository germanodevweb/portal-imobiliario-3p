const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  hellip: "…",
  ndash: "–",
  mdash: "—",
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_match, code: string) => {
      const n = Number.parseInt(code, 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : "";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex: string) => {
      const n = Number.parseInt(hex, 16);
      return Number.isFinite(n) ? String.fromCodePoint(n) : "";
    })
    .replace(/&([a-z]+);/gi, (match, name: string) => {
      const key = name.toLowerCase();
      return NAMED_ENTITIES[key] ?? match;
    });
}

/**
 * Converte HTML (ex.: TipTap) em texto plano para meta, JSON-LD e feeds.
 */
export function htmlToPlainText(html: string, maxLength?: number): string {
  if (!html.trim()) return "";

  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<\/li>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  text = decodeHtmlEntities(text).replace(/\s+/g, " ").trim();

  if (maxLength !== undefined && text.length > maxLength) {
    const slice = text.slice(0, maxLength).trim();
    return slice.endsWith("…") ? slice : `${slice}…`;
  }

  return text;
}
