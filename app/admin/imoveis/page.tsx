import Link from "next/link";
import { getAdminProperties } from "@/lib/admin/queries";
import { AdminImoveisSearch } from "@/app/components/admin/AdminImoveisSearch";

/**
 * Listagem administrativa de imóveis.
 * Server Component — busca dados no servidor via Prisma.
 */
export const dynamic = "force-dynamic";

export default async function AdminImoveisPage() {
  let properties;
  try {
    properties = await getAdminProperties();
  } catch (err) {
    console.error("[AdminImoveisPage] Erro ao carregar imóveis:", err);
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">Erro ao carregar imóveis</h2>
        <p className="mt-2 text-sm text-red-700">
          {err instanceof Error ? err.message : String(err)}
        </p>
        <p className="mt-2 text-xs text-red-600">
          Verifique se o banco está sincronizado (pnpm prisma db push) e o Prisma Client foi regenerado (pnpm prisma generate).
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Imóveis
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {properties.length}{" "}
            {properties.length !== 1 ? "imóveis cadastrados" : "imóvel cadastrado"}
          </p>
        </div>
        <Link
          href="/admin/imoveis/novo"
          className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
        >
          Novo imóvel
        </Link>
      </div>

      <AdminImoveisSearch properties={properties} />
    </div>
  );
}
