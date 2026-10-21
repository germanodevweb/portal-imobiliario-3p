import {
  formatBrazilianPhoneDisplay,
  normalizePhoneBR,
  validateBrazilianWhatsappField,
} from "@/lib/utils/phone";

export type FolderPhoneDisplay = {
  ddd: string;
  numberLine: string;
};

export function validateFolderPhoneInput(
  input: string
): { ok: true; display: FolderPhoneDisplay } | { ok: false; error: string } {
  const validated = validateBrazilianWhatsappField(input, {
    requiredMessage: "Informe um WhatsApp válido para gerar o folder.",
  });
  if (!validated.ok) {
    return validated;
  }

  const display = splitFolderPhoneDisplay(validated.normalized);
  if (!display) {
    return { ok: false, error: "Telefone inválido." };
  }

  return { ok: true, display };
}

export function splitFolderPhoneDisplay(
  input: string
): FolderPhoneDisplay | null {
  const digits = normalizePhoneBR(input.trim());
  if (digits.length !== 11) return null;

  const formatted = formatBrazilianPhoneDisplay(digits);
  const match = formatted.match(/^\((\d{2})\)\s*(\d{4,5}-\d{4})$/);
  if (!match) return null;

  return {
    ddd: match[1],
    numberLine: match[2],
  };
}
