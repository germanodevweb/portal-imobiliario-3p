import { validateFolderPhoneInput } from "@/lib/folder/folder-phone";
import type { FolderVerticalEditablePayload } from "@/lib/folder/types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function readOptionalString(v: unknown, maxLen: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, maxLen);
}

export type ValidateFolderEditableResult =
  | { ok: true; payload: FolderVerticalEditablePayload }
  | { ok: false; error: string };

export function validateFolderVerticalEditablePayload(
  body: unknown
): ValidateFolderEditableResult {
  if (!isRecord(body)) {
    return { ok: false, error: "Corpo JSON inválido." };
  }

  const sealBannerText = readOptionalString(body.sealBannerText, 30);
  const showFullPhoto = body.showFullPhoto === true;

  const highlightBedrooms =
    typeof body.highlightBedrooms === "number" && Number.isFinite(body.highlightBedrooms)
      ? Math.max(0, Math.min(99, Math.round(body.highlightBedrooms)))
      : typeof body.bedrooms === "number" && Number.isFinite(body.bedrooms)
        ? Math.max(0, Math.min(99, Math.round(body.bedrooms)))
        : null;
  if (highlightBedrooms === null) {
    return { ok: false, error: "Quartos inválidos." };
  }

  const highlightGarage =
    typeof body.highlightGarage === "number" && Number.isFinite(body.highlightGarage)
      ? Math.max(0, Math.min(99, Math.round(body.highlightGarage)))
      : typeof body.garage === "number" && Number.isFinite(body.garage)
        ? Math.max(0, Math.min(99, Math.round(body.garage)))
        : null;
  if (highlightGarage === null) {
    return { ok: false, error: "Vagas inválidas." };
  }

  const showLeisure = body.showLeisure !== false;

  const phoneRaw =
    typeof body.phone === "string"
      ? body.phone
      : typeof body.phoneDisplay === "string"
        ? body.phoneDisplay
        : "";
  const phoneCheck = validateFolderPhoneInput(phoneRaw);
  if (!phoneCheck.ok) {
    return { ok: false, error: phoneCheck.error };
  }

  return {
    ok: true,
    payload: {
      sealBannerText,
      showFullPhoto,
      highlightBedrooms,
      showLeisure,
      highlightGarage,
      phone: phoneRaw.trim(),
    },
  };
}
