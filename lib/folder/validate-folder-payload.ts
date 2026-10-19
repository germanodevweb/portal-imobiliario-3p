import { sanitizeNeighborhoodLabel } from "@/lib/folder/sanitize-neighborhood";
import {
  FOLDER_HIGHLIGHT_ICON_IDS,
  FOLDER_NEARBY_ICON_IDS,
  FOLDER_SEAL_PRESETS,
  type FolderHighlight,
  type FolderHighlightIconId,
  type FolderNearbyIconId,
  type FolderNearbyPoint,
  type FolderSealPreset,
  type PropertyFolderVerticalPayload,
} from "@/lib/folder/types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function readString(v: unknown, maxLen: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, maxLen);
}

function readOptionalString(v: unknown, maxLen: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, maxLen);
}

function isNearbyIcon(v: string): v is FolderNearbyIconId {
  return (FOLDER_NEARBY_ICON_IDS as readonly string[]).includes(v);
}

function isHighlightIcon(v: string): v is FolderHighlightIconId {
  return (FOLDER_HIGHLIGHT_ICON_IDS as readonly string[]).includes(v);
}

function isSeal(v: string): v is FolderSealPreset {
  return (FOLDER_SEAL_PRESETS as readonly string[]).includes(v);
}

function parseNearbyPoints(raw: unknown): FolderNearbyPoint[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length > 6) return null;
  const out: FolderNearbyPoint[] = [];
  for (const item of raw) {
    if (!isRecord(item)) return null;
    const iconId = item.iconId;
    const label = readString(item.label, 28);
    if (typeof iconId !== "string" || !isNearbyIcon(iconId) || !label) {
      return null;
    }
    out.push({ iconId, label });
  }
  return out;
}

function parseHighlights(raw: unknown): FolderHighlight[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length !== 3) return null;
  const out: FolderHighlight[] = [];
  for (const item of raw) {
    if (!isRecord(item)) return null;
    const iconId = item.iconId;
    const text = readString(item.text, 56);
    if (typeof iconId !== "string" || !isHighlightIcon(iconId) || !text) {
      return null;
    }
    out.push({ iconId, text });
  }
  return out;
}

function parsePhotoUrls(raw: unknown): [string, string, string] | null {
  if (!Array.isArray(raw) || raw.length !== 3) return null;
  const urls: string[] = [];
  for (const u of raw) {
    if (typeof u !== "string" || !u.trim()) return null;
    urls.push(u.trim());
  }
  return [urls[0], urls[1], urls[2]];
}

export type ValidateFolderResult =
  | { ok: true; payload: PropertyFolderVerticalPayload }
  | { ok: false; error: string };

export function validatePropertyFolderVerticalPayload(
  body: unknown
): ValidateFolderResult {
  if (!isRecord(body)) {
    return { ok: false, error: "Corpo JSON inválido." };
  }

  const developmentName = readString(body.developmentName, 52);
  if (!developmentName) {
    return { ok: false, error: "Nome do empreendimento é obrigatório." };
  }

  const neighborhoodRaw = readString(body.neighborhood, 32);
  if (!neighborhoodRaw) {
    return { ok: false, error: "Bairro é obrigatório." };
  }
  const neighborhood = sanitizeNeighborhoodLabel(neighborhoodRaw);
  if (!neighborhood) {
    return { ok: false, error: "Bairro é obrigatório." };
  }

  const locationText = readString(body.locationText, 320);
  if (!locationText) {
    return { ok: false, error: "Texto de localização é obrigatório." };
  }

  const bedrooms =
    typeof body.bedrooms === "number" && Number.isFinite(body.bedrooms)
      ? Math.max(0, Math.min(99, Math.round(body.bedrooms)))
      : null;
  if (bedrooms === null) {
    return { ok: false, error: "Quartos inválidos." };
  }

  const nearbyPoints = parseNearbyPoints(body.nearbyPoints);
  if (!nearbyPoints) {
    return { ok: false, error: "Pontos próximos inválidos (máx. 6)." };
  }

  const highlights = parseHighlights(body.highlights);
  if (!highlights) {
    return { ok: false, error: "Informe exatamente 3 diferenciais." };
  }

  const sealRaw = body.seal;
  if (typeof sealRaw !== "string" || !isSeal(sealRaw)) {
    return { ok: false, error: "Selo inválido." };
  }

  const photoUrls = parsePhotoUrls(body.photoUrls);
  if (!photoUrls) {
    return { ok: false, error: "Selecione 3 fotos válidas." };
  }

  const footerPhrase =
    readString(body.footerPhrase, 48) ?? "Seu novo capítulo começa aqui!";

  const showWhatsApp = body.showWhatsApp === true;

  return {
    ok: true,
    payload: {
      developmentName,
      subtitle: readOptionalString(body.subtitle, 40),
      neighborhood,
      locationText,
      bedrooms,
      nearbyPoints,
      highlights,
      seal: sealRaw,
      footerPhrase,
      showWhatsApp,
      photoUrls,
    },
  };
}
