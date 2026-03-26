// ---------------------------------------------------------------------------
// Utilitários de paginação server-side para o portal imobiliário
//
// ESTRATÉGIA SEO:
//   - Todas as páginas paginadas são indexáveis (index, follow).
//   - noindex em página 2+ é prática obsoleta que prejudica a descoberta
//     de imóveis pelo Google.
//   - Cada página tem canonical auto-referenciado:
//       página 1  → /base-url (sem ?page=)
//       página N  → /base-url?page=N
//   - Título inclui "— Página N" para diferenciação semântica.
//   - rel="prev" e rel="next" são fornecidos pelos componentes de página.
// ---------------------------------------------------------------------------

/** Quantidade de imóveis por página em todas as listagens do portal. */
export const ITEMS_PER_PAGE = 24;

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Lê o parâmetro ?page= dos searchParams e retorna um número inteiro ≥ 1.
 * Valores inválidos ou ausentes retornam 1 (primeira página).
 */
export function parsePage(
  searchParams: { [key: string]: string | string[] | undefined }
): number {
  const raw = searchParams["page"];
  const str = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(str ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

// ---------------------------------------------------------------------------
// Cálculos
// ---------------------------------------------------------------------------

/** Total de páginas necessárias para exibir `count` itens. Mínimo 1. */
export function calculateTotalPages(count: number): number {
  return Math.max(1, Math.ceil(count / ITEMS_PER_PAGE));
}

/** Offset (skip) a ser passado ao Prisma para a página informada. */
export function getSkip(page: number): number {
  return (page - 1) * ITEMS_PER_PAGE;
}

// ---------------------------------------------------------------------------
// SEO: título e canonical paginados
// ---------------------------------------------------------------------------

/**
 * Insere "— Página N" antes do separador " | SITE_NAME" no título.
 * Página 1 retorna o título original sem alteração.
 *
 * @example
 * buildPageTitle("Imóveis em São Paulo | 3Pinheiros", 2)
 * // → "Imóveis em São Paulo — Página 2 | 3Pinheiros"
 */
export function buildPageTitle(baseTitle: string, page: number): string {
  if (page <= 1) return baseTitle;
  const sep = " | ";
  const idx = baseTitle.lastIndexOf(sep);
  if (idx === -1) return `${baseTitle} — Página ${page}`;
  return `${baseTitle.slice(0, idx)} — Página ${page}${sep}${baseTitle.slice(idx + sep.length)}`;
}

/**
 * Canonical URL para uma página paginada.
 *   - Página 1: retorna a base sem ?page= (URL canônica limpa).
 *   - Página N > 1: retorna base?page=N (ou base?outroParam=X&page=N).
 *
 * @param base       URL base sem query string (ex: "/cidade/sao-paulo")
 * @param page       Número da página atual
 * @param otherParams Outros query params a preservar (ex: filtros de /imoveis)
 */
export function buildPaginatedCanonical(
  base: string,
  page: number,
  otherParams?: Record<string, string>
): string {
  const params = new URLSearchParams(otherParams);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
