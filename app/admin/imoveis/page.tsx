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
    const message = err instanceof Error ? err.message : String(err);
    const needsMigration =
      message.includes("builderName") ||
      message.includes("Builder") ||
      message.includes("Neighborhood");

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">Erro ao carregar imóveis</h2>
        <p className="mt-2 text-sm text-red-700">{message}</p>
        {needsMigration ? (
          <div className="mt-4 space-y-3 text-sm text-red-900">
            <p className="font-medium">Migration pendente no banco ou Prisma Client desatualizado.</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                No <strong>SQL Editor do Supabase</strong>, execute as migrations pendentes em{" "}
                <code className="rounded bg-red-100 px-1">prisma/migrations/</code> (Builder e
                Neighborhood, se ainda não rodou).
              </li>
              <li>
                No terminal:{" "}
                <code className="rounded bg-zinc-900 px-2 py-1 text-xs text-zinc-100">
                  pnpm prisma generate
                </code>
              </li>
              <li>Reinicie o servidor dev (pare e rode <code className="rounded bg-red-100 px-1">pnpm dev</code> de novo).</li>
            </ol>
          </div>
        ) : (
          <p className="mt-2 text-xs text-red-600">
            Verifique se o banco está sincronizado e o Prisma Client foi regenerado.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Imóveis
          </h1>
          <p className="mt-1 text-sm text-zinc-300">
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
