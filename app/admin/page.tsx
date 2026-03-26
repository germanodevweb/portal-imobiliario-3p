import Link from "next/link";

/**
 * Dashboard do painel administrativo.
 * Ponto de entrada da área admin.
 */
export default function AdminPage() {
  return (
    <div className="pb-12">
      <header className="mb-12">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Painel de Gestão Imobiliária
        </h1>
        <p className="mt-3 text-base font-medium tracking-wide text-green-700/80 sm:text-lg">
          Disciplina no processo. Excelência nos resultados.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/imoveis"
          className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:border-green-400 hover:bg-green-50 hover:shadow-md"
        >
          <span className="text-3xl" role="img" aria-hidden>
            🏠
          </span>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900">
            Imóveis
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Listar, cadastrar e editar imóveis do portal.
          </p>
          <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-green-700 transition-colors group-hover:text-green-800">
            Gerenciar
            <span aria-hidden>→</span>
          </span>
        </Link>
        <Link
          href="/admin/leads"
          className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:border-green-400 hover:bg-green-50 hover:shadow-md"
        >
          <span className="text-3xl" role="img" aria-hidden>
            📋
          </span>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900">
            Leads
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Visualizar e acompanhar leads do portal.
          </p>
          <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-green-700 transition-colors group-hover:text-green-800">
            Gerenciar
            <span aria-hidden>→</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
