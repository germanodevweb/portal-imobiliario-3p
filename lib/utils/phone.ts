/**
 * Validação e formatação de telefone/WhatsApp brasileiro.
 * Foco: DDD válido + celular (11 dígitos, nono dígito 9).
 */

export const WHATSAPP_PHONE_EXAMPLE = "(85) 99123-4567";

export const WHATSAPP_PHONE_ERROR_MESSAGE =
  `Informe um WhatsApp válido com DDD. Exemplo: ${WHATSAPP_PHONE_EXAMPLE}`;

/** DDDs válidos no Brasil (ANATEL). */
const VALID_BRAZILIAN_DDDS = new Set([
  "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "21", "22", "24",
  "27", "28",
  "31", "32", "33", "34", "35", "37", "38",
  "41", "42", "43", "44", "45", "46",
  "47", "48", "49",
  "51", "53", "54", "55",
  "61",
  "62", "64",
  "63",
  "65", "66",
  "67",
  "68",
  "69",
  "71", "73", "74", "75", "77",
  "79",
  "81", "87",
  "82",
  "83",
  "84",
  "85", "88",
  "86", "89",
  "91", "93", "94",
  "92", "97",
  "95",
  "96",
  "98", "99",
]);

const OBVIOUS_FAKE_NUMBERS = new Set([
  "00000000000",
  "11111111111",
  "22222222222",
  "33333333333",
  "44444444444",
  "55555555555",
  "66666666666",
  "77777777777",
  "88888888888",
  "99999999999",
  "12345678900",
  "12345678901",
  "01234567890",
  "98765432100",
  "98765432109",
]);

/** Remove tudo que não for dígito; descarta código do país 55 quando presente. */
export function normalizePhoneBR(input: string): string {
  let digits = input.replace(/\D/g, "");

  if (
    digits.startsWith("55") &&
    (digits.length === 12 || digits.length === 13)
  ) {
    digits = digits.slice(2);
  }

  return digits;
}

function hasSequentialDigits(digits: string): boolean {
  if (digits.length < 3) return false;

  let ascending = true;
  let descending = true;

  for (let i = 1; i < digits.length; i += 1) {
    const current = Number(digits[i]);
    const previous = Number(digits[i - 1]);
    if (current !== previous + 1) ascending = false;
    if (current !== previous - 1) descending = false;
  }

  return ascending || descending;
}

function isFakeMobileSubscriber(subscriber: string): boolean {
  if (subscriber.length !== 9 || subscriber[0] !== "9") return false;

  if (new Set(subscriber).size === 1) return true;

  const localPart = subscriber.slice(1);
  if (new Set(localPart).size === 1) return true;
  if (hasSequentialDigits(subscriber)) return true;
  if (hasSequentialDigits(localPart)) return true;

  return false;
}

function isObviousFakeNumber(digits: string): boolean {
  if (OBVIOUS_FAKE_NUMBERS.has(digits)) return true;
  if (new Set(digits).size === 1) return true;
  if (hasSequentialDigits(digits)) return true;

  if (digits.length === 11) {
    return isFakeMobileSubscriber(digits.slice(2));
  }

  return false;
}

function isValidBrazilianDdd(ddd: string): boolean {
  return VALID_BRAZILIAN_DDDS.has(ddd);
}

/** Celular/WhatsApp BR: 11 dígitos (DDD + 9 + número). */
export function isValidBrazilianWhatsapp(input: string): boolean {
  const digits = normalizePhoneBR(input);

  if (digits.length !== 11) return false;
  if (!isValidBrazilianDdd(digits.slice(0, 2))) return false;
  if (digits[2] !== "9") return false;
  if (isObviousFakeNumber(digits)) return false;

  return true;
}

export function formatBrazilianPhoneDisplay(input: string): string {
  const digits = normalizePhoneBR(input);

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return input.trim();
}

/** Exibe formatado quando possível; mantém legado inválido legível no admin. */
export function formatPhoneForDisplay(input: string): string {
  const digits = normalizePhoneBR(input);
  if (digits.length === 10 || digits.length === 11) {
    return formatBrazilianPhoneDisplay(digits);
  }
  return input.trim();
}

export function formatWhatsappLink(phone: string, message?: string): string {
  const digits = normalizePhoneBR(phone);
  const withCountry = `55${digits}`;
  const base = `https://api.whatsapp.com/send?phone=${withCountry}`;

  if (message && message.trim().length > 0) {
    return `${base}&text=${encodeURIComponent(message)}`;
  }

  return base;
}

export function validateBrazilianWhatsappField(
  input: string,
  options?: { requiredMessage?: string }
): { ok: true; normalized: string } | { ok: false; error: string } {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      ok: false,
      error: options?.requiredMessage ?? "Telefone é obrigatório",
    };
  }

  const normalized = normalizePhoneBR(trimmed);

  if (!isValidBrazilianWhatsapp(normalized)) {
    return { ok: false, error: WHATSAPP_PHONE_ERROR_MESSAGE };
  }

  return { ok: true, normalized };
}
