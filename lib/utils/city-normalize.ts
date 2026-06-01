/**
 * Normalização de municípios — chave canônica para deduplicação.
 * "Fortaleza-Ceará", "FORTALEZA", "Fortaleza - CE" => key "fortaleza" (no escopo do estado).
 */

import { BRAZIL_STATE_OPTIONS } from "@/lib/constants/brazil-states";
import { collapseWhitespace } from "@/lib/utils/neighborhood-normalize";

export { collapseWhitespace };

const STATE_TOKEN_KEYS = new Set(
  BRAZIL_STATE_OPTIONS.flatMap((o) => [
    o.uf.toLowerCase(),
    normalizeAsciiKey(o.name),
  ])
);

function normalizeAsciiKey(text: string): string {
  return collapseWhitespace(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function normalizeCityKey(name: string): string {
  return normalizeAsciiKey(name);
}

export function cityKeysMatch(a: string, b: string): boolean {
  return normalizeCityKey(a) === normalizeCityKey(b);
}

function isStateToken(token: string): boolean {
  const trimmed = token.trim();
  if (!trimmed) return false;
  if (trimmed.length === 2 && STATE_TOKEN_KEYS.has(trimmed.toLowerCase())) {
    return true;
  }
  return STATE_TOKEN_KEYS.has(normalizeAsciiKey(trimmed));
}

/** Remove sufixo de UF/estado embutido no nome da cidade. */
export function stripEmbeddedStateFromCity(cityRaw: string): string {
  let city = collapseWhitespace(cityRaw);
  if (!city) return city;

  const splitPattern = /[\s]*(?:[-–—/|,]|\s+-\s+)[\s]*/;
  const parts = city.split(splitPattern).map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    if (isStateToken(last)) {
      return parts.slice(0, -1).join(" ");
    }
  }

  return city;
}

export function parseCityInput(cityRaw: string): {
  cityName: string;
  normalizedKey: string;
} {
  const stripped = stripEmbeddedStateFromCity(cityRaw);
  const cityName = formatCityDisplayName(stripped);
  const normalizedKey = normalizeCityKey(stripped);

  return { cityName, normalizedKey };
}

export function formatCityDisplayName(name: string): string {
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

export function slugifyCity(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveCanonicalState(stateRaw: string): {
  state: string;
  stateSlug: string;
} {
  const trimmed = collapseWhitespace(stateRaw);
  if (!trimmed) {
    return { state: "", stateSlug: "" };
  }

  const byName = BRAZIL_STATE_OPTIONS.find((o) => o.name === trimmed);
  if (byName) {
    return { state: byName.name, stateSlug: slugifyCity(byName.name) };
  }

  const byUf = BRAZIL_STATE_OPTIONS.find(
    (o) => o.uf.toLowerCase() === trimmed.toLowerCase()
  );
  if (byUf) {
    return { state: byUf.name, stateSlug: slugifyCity(byUf.name) };
  }

  const byNormalizedName = BRAZIL_STATE_OPTIONS.find(
    (o) => normalizeAsciiKey(o.name) === normalizeAsciiKey(trimmed)
  );
  if (byNormalizedName) {
    return {
      state: byNormalizedName.name,
      stateSlug: slugifyCity(byNormalizedName.name),
    };
  }

  const formatted = formatCityDisplayName(trimmed);
  return { state: formatted, stateSlug: slugifyCity(formatted) };
}

export type CityLocationKey = {
  normalizedKey: string;
  stateSlug: string;
};

export function buildCityLocationKey(cityRaw: string, stateRaw: string): CityLocationKey {
  const { normalizedKey } = parseCityInput(cityRaw);
  const { stateSlug } = resolveCanonicalState(stateRaw);
  return { normalizedKey, stateSlug };
}

export function cityLocationKeyString(key: CityLocationKey): string {
  return `${key.normalizedKey}::${key.stateSlug}`;
}
