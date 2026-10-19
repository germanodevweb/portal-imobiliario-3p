/** Normaliza texto livre de ambiente para comparação (case, acentos, espaços). */
export function normalizeEnvironmentText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function environmentContains(normalizedEnv: string, token: string): boolean {
  const t = normalizeEnvironmentText(token);
  return normalizedEnv.includes(t);
}

export function environmentContainsAny(
  normalizedEnv: string,
  tokens: readonly string[]
): boolean {
  return tokens.some((token) => environmentContains(normalizedEnv, token));
}
