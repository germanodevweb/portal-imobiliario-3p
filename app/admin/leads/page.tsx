import Link from "next/link";
import { getAdminLeads } from "@/lib/admin/queries";
import { AdminLeadsSearch } from "@/app/components/admin/AdminLeadsSearch";

/**
 * Listagem administrativa de leads.
 * Server Component — busca dados no servidor via Prisma.
 * Restrito ao painel admin. Não indexável.
 */
export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  let leads: AdminLeadListItem[];
  try {
    leads = await getAdminLeads();
  } catch (err) {
    console.error("[AdminLeadsPage] Erro ao carregar leads:", err);
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">Erro ao carregar leads</h2>
        <p className="mt-2 text-sm text-red-700">
          {err instanceof Error ? err.message : String(err)}
        </p>
        <p className="mt-2 text-xs text-red-600">
          Verifique se o banco está sincronizado (pnpm prisma db push) e o Prisma
          Client foi regenerado (pnpm prisma generate).
        </p>
      </div>
    );
  }

  const total = leads.length;
  const novos = leads.filter((l) => l.status === "novo").length;

  return (
    <div className="pb-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Leads
          </h1>
          <p className="mt-2 text-sm text-zinc-500 sm:text-base">
            Visualize e acompanhe os leads do portal. Origem e status para
            organizar o funil.
          </p>
        </header>
        <Link
          href="/admin/leads/new"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
        >
          Novo lead
        </Link>
      </div>

      {total > 0 && (
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
            <span className="text-2xl font-bold text-zinc-900">{total}</span>
            <span className="ml-2 text-sm text-zinc-500">
              {total === 1 ? "lead" : "leads"}
            </span>
          </div>
          {novos > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
              <span className="text-2xl font-bold text-zinc-700">{novos}</span>
              <span className="ml-2 text-sm text-zinc-500">novos</span>
            </div>
          )}
        </div>
      )}

      <AdminLeadsSearch leads={leads} />
    </div>
  );
}
