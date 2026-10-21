import { parseListingDevelopmentName } from "@/lib/folder/parse-listing-name";
import { sanitizeNeighborhoodLabel } from "@/lib/folder/sanitize-neighborhood";

/** Largura aproximada do título no topo (1 linha) antes do wrap automático. */
const TITLE_BAR_MAX_CHARS = 44;

function truncateToLastWholeWord(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  const slice = t.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > 0) return slice.slice(0, lastSpace).trimEnd();
  return slice.trimEnd();
}

/**
 * Nome exibido no topo do folder: cadastro → trecho do title → title truncado por palavra.
 */
export function resolveFolderDevelopmentName(
  developmentNameDb: string | null | undefined,
  title: string
): string {
  const fromDb = developmentNameDb?.trim();
  if (fromDb) return fromDb.slice(0, 80);

  const trimmed = title.trim();
  if (!trimmed) return "";

  const fromTitle = parseListingDevelopmentName(trimmed);
  if (fromTitle && fromTitle !== trimmed) {
    return fromTitle.slice(0, 80);
  }

  return truncateToLastWholeWord(trimmed, TITLE_BAR_MAX_CHARS);
}

/** Pill do topo: BAIRRO · CIDADE (caixa alta), sem bairro → só cidade. */
export function resolveFolderLocationLine(
  neighborhood: string | null | undefined,
  city: string
): string {
  const bairro = sanitizeNeighborhoodLabel(neighborhood ?? "");
  const cidade = sanitizeNeighborhoodLabel(city);
  if (bairro && cidade) return `${bairro.toUpperCase()} · ${cidade.toUpperCase()}`;
  if (cidade) return cidade.toUpperCase();
  if (bairro) return bairro.toUpperCase();
  return "";
}
