/**
 * Validação de e-mail para formulários de lead/contato.
 * Não confirma existência da caixa — apenas formato plausível e anti-fake básico.
 */

export const EMAIL_ERROR_MESSAGE =
  "Informe um e-mail válido. Exemplo: nome@email.com";

const EMAIL_PATTERN =
  /^[a-z0-9._%+-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

const BLOCKED_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "teste.com",
  "email.com",
  "mail.com",
  "fake.com",
  "invalid.com",
  "nomail.com",
  "nowhere.com",
  "yopmail.com",
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
]);

const BLOCKED_LOCAL_PARTS = new Set([
  "test",
  "teste",
  "fake",
  "email",
  "mail",
  "asdf",
  "qwerty",
  "123456",
  "123456789",
  "aaa",
  "abc",
  "noreply",
  "no-reply",
]);

/** Normaliza para comparação/armazenamento (trim + minúsculas). */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

function isObviousFakeEmail(email: string, localPart: string, domain: string): boolean {
  if (BLOCKED_DOMAINS.has(domain)) return true;
  if (BLOCKED_LOCAL_PARTS.has(localPart)) return true;
  if (/^\d+$/.test(localPart)) return true;
  if (new Set(localPart).size === 1 && localPart.length >= 3) return true;

  const domainBase = domain.split(".")[0] ?? "";
  if (domainBase.length < 2) return true;

  if (localPart.includes("..") || domain.includes("..")) return true;

  return false;
}

export function isValidLeadEmail(input: string): boolean {
  const email = normalizeEmail(input);

  if (email.length === 0 || email.length > 254) return false;

  const atIndex = email.lastIndexOf("@");
  if (atIndex <= 0 || atIndex >= email.length - 1) return false;

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (localPart.length < 2 || domain.length < 4) return false;
  if (!domain.includes(".")) return false;

  const tld = domain.split(".").pop() ?? "";
  if (tld.length < 2) return false;

  if (!EMAIL_PATTERN.test(email)) return false;
  if (isObviousFakeEmail(email, localPart, domain)) return false;

  return true;
}

export function validateEmailField(
  input: string,
  options?: { requiredMessage?: string }
): { ok: true; normalized: string } | { ok: false; error: string } {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      ok: false,
      error: options?.requiredMessage ?? "E-mail é obrigatório",
    };
  }

  const normalized = normalizeEmail(trimmed);

  if (!isValidLeadEmail(normalized)) {
    return { ok: false, error: EMAIL_ERROR_MESSAGE };
  }

  return { ok: true, normalized };
}
