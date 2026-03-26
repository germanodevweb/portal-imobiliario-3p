// ---------------------------------------------------------------------------
// Utilitários para seed programático
// ---------------------------------------------------------------------------

/**
 * Normaliza string para slug: lowercase, hífens, sem acentos.
 * Garante consistência com as rotas programáticas do portal.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Retorna inteiro aleatório no intervalo [min, max] (inclusivo).
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Retorna elemento aleatório do array.
 */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/**
 * Gera preço aleatório em faixa realista (em centavos para Decimal).
 * Retorna string para compatibilidade com Prisma Decimal.
 */
export function randomPrice(minReais: number, maxReais: number): string {
  const value = Math.round(
    minReais + Math.random() * (maxReais - minReais)
  );
  return String(value);
}
