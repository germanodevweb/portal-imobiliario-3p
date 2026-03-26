import Link from "next/link";

// ---------------------------------------------------------------------------
// Componente de paginação — Server Component puro, sem client JS
//
// Mobile: "← Anterior | Página X de Y | Próxima →"
// Desktop: "← Anterior | 1  2  3  …  10 | Próxima →"
// ---------------------------------------------------------------------------

type Props = {
  currentPage: number;
  totalPages: number;
  /** Caminho base da URL, sem query string. Ex: "/cidade/sao-paulo" */
  basePath: string;
  /** Query params extras a preservar (ex: filtros de /imoveis), sem 'page'. */
  queryParams?: Record<string, string>;
};

function buildUrl(
  basePath: string,
  page: number,
  queryParams?: Record<string, string>
): string {
  const params = new URLSearchParams(queryParams);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Retorna a sequência de números de página a exibir, com "..." onde há saltos.
 * Sempre inclui primeira, última e vizinhos do atual.
 */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}

export function Pagination({ currentPage, totalPages, basePath, queryParams }: Props) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);
  const prevUrl =
    currentPage > 1 ? buildUrl(basePath, currentPage - 1, queryParams) : null;
  const nextUrl =
    currentPage < totalPages ? buildUrl(basePath, currentPage + 1, queryParams) : null;

  const base =
    "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600";
  const activeStyles = `${base} border-green-700 bg-green-700 text-white`;
  const normalStyles = `${base} border-zinc-200 bg-white text-zinc-700 hover:border-green-600 hover:text-green-700`;
  const disabledStyles = `${base} border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed`;

  return (
    <nav aria-label="Paginação de imóveis" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {/* Botão Anterior */}
      {prevUrl ? (
        <Link href={prevUrl} rel="prev" className={normalStyles}>
          ← <span className="ml-1 hidden sm:inline">Anterior</span>
        </Link>
      ) : (
        <span className={disabledStyles} aria-disabled="true">
          ← <span className="ml-1 hidden sm:inline">Anterior</span>
        </span>
      )}

      {/* Mobile: texto "Página X de Y" */}
      <span className="px-3 text-sm text-zinc-500 sm:hidden">
        Página {currentPage} de {totalPages}
      </span>

      {/* Desktop: números de página */}
      <div className="hidden items-center gap-1.5 sm:flex" aria-label="Páginas">
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-zinc-400" aria-hidden="true">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildUrl(basePath, p, queryParams)}
              className={p === currentPage ? activeStyles : normalStyles}
              aria-current={p === currentPage ? "page" : undefined}
              aria-label={`Página ${p}`}
            >
              {p}
            </Link>
          )
        )}
      </div>

      {/* Botão Próxima */}
      {nextUrl ? (
        <Link href={nextUrl} rel="next" className={normalStyles}>
          <span className="mr-1 hidden sm:inline">Próxima</span> →
        </Link>
      ) : (
        <span className={disabledStyles} aria-disabled="true">
          <span className="mr-1 hidden sm:inline">Próxima</span> →
        </span>
      )}
    </nav>
  );
}
