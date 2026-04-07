/**
 * Sessão simples do painel admin (cookie httpOnly, sem utilizadores).
 */

export const ADMIN_AUTH_COOKIE_NAME = "admin_auth";
export const ADMIN_AUTH_COOKIE_VALUE = "true";
/** 1 dia em segundos */
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

const DEV_FALLBACK_PASSWORD = "8471";

/**
 * Senha esperada para o login do admin.
 *
 * - **Produção:** apenas `ADMIN_PASSWORD` no ambiente; se ausente ou vazia, retorna
 *   `null` (nenhuma senha digitada coincide — login falha, sem fallback).
 * - **Desenvolvimento:** `ADMIN_PASSWORD` se definida; caso contrário, fallback
 *   temporário `DEV_FALLBACK_PASSWORD` (apenas fora de produção).
 */
export function getExpectedAdminPassword(): string | null {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  return DEV_FALLBACK_PASSWORD;
}

/**
 * Evita open redirect: só caminhos internos sob `/admin`.
 */
export function sanitizeAdminRedirectAfterLogin(input: string | undefined): string {
  if (!input || typeof input !== "string") return "/admin";
  const trimmed = input.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/admin";
  if (!trimmed.startsWith("/admin")) return "/admin";
  return trimmed;
}

export function isAdminSessionCookieValue(value: string | undefined): boolean {
  return value === ADMIN_AUTH_COOKIE_VALUE;
}
