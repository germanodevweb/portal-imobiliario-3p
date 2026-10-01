/**
 * Capitalização de nomes de lugares (cidades e bairros) para exibição.
 * Preposições em minúsculo; correções de acento para nomes conhecidos.
 */

import { CEARA_CITIES } from "@/lib/constants/cities";
import { collapseWhitespace } from "@/lib/utils/collapse-whitespace";

const LOWERCASE_PARTICLES = new Set(["de", "do", "da", "dos", "das", "e"]);

/** Palavra isolada (ASCII) → forma com acento antes da capitalização */
const WORD_ACCENT_BY_ASCII: Record<string, string> = {
  sao: "são",
  jose: "josé",
  goncalo: "gonçalo",
  eusebio: "eusébio",
  maracanau: "maracanaú",
  pecem: "pecém",
  acu: "açu",
  guaruja: "guarujá",
  maceio: "maceió",
  brasilia: "brasília",
  goiania: "goiânia",
  belem: "belém",
};

export function normalizePlaceAsciiKey(text: string): string {
  return collapseWhitespace(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Chave ASCII (sem acento, lowercase) → forma canônica de exibição */
const KNOWN_CITY_DISPLAY_BY_KEY = new Map<string, string>(
  CEARA_CITIES.map((name) => [normalizePlaceAsciiKey(name), name])
);

/** Cidades / localidades fora da lista fixa do Ceará */
const EXTRA_CITY_DISPLAY_BY_KEY: Record<string, string> = {
  pecem: "Pecém",
};

for (const [key, display] of Object.entries(EXTRA_CITY_DISPLAY_BY_KEY)) {
  KNOWN_CITY_DISPLAY_BY_KEY.set(key, display);
}

function applyWordAccent(wordLowerAscii: string): string {
  return WORD_ACCENT_BY_ASCII[wordLowerAscii] ?? wordLowerAscii;
}

/**
 * Formata nome para exibição (cadastro novo e sugestão em scripts).
 * Não altera slugs — use slugify* separadamente.
 */
export function formatPlaceDisplayName(name: string): string {
  const collapsed = collapseWhitespace(name);
  if (!collapsed) return collapsed;

  const words = collapsed.split(" ");
  return words
    .map((word, index) => {
      if (!word) return word;
      const lowerAscii = word
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR");
      const withAccent = applyWordAccent(lowerAscii);

      if (index > 0 && LOWERCASE_PARTICLES.has(withAccent)) {
        return withAccent;
      }

      return (
        withAccent.charAt(0).toLocaleUpperCase("pt-BR") +
        withAccent.slice(1)
      );
    })
    .join(" ");
}

export function suggestCityDisplayName(raw: string): string {
  const key = normalizePlaceAsciiKey(raw);
  const known = KNOWN_CITY_DISPLAY_BY_KEY.get(key);
  if (known) return known;
  return formatPlaceDisplayName(raw);
}

export function suggestNeighborhoodDisplayName(raw: string): string {
  return formatPlaceDisplayName(raw);
}

export type PlaceNameKind = "city" | "neighborhood";

export function suggestPlaceDisplayName(
  raw: string,
  kind: PlaceNameKind
): string {
  return kind === "city"
    ? suggestCityDisplayName(raw)
    : suggestNeighborhoodDisplayName(raw);
}
