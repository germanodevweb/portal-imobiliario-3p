import Link from "next/link";
import { getAdminBuilders } from "@/lib/admin/builder-queries";
import { AdminBuildersSearch } from "@/app/components/admin/AdminBuildersSearch";
import { AdminPendingMigrationNotice } from "@/app/components/admin/AdminPendingMigrationNotice";
import { BUILDER_MIGRATION_SQL } from "@/lib/admin/pending-migration-sql";
import { hasBuilderTable } from "@/lib/admin/schema-migration";

export const dynamic = "force-dynamic";

export default async function AdminConstrutorasPage() {
  const migrationRequired = !(await hasBuilderTable());
  const builders = migrationRequired ? [] : await getAdminBuilders();

  if (migrationRequired) {
    return (
      <div className="pb-12">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Construtoras
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-300 sm:text-base">
            Mesma lógica de Bairros: cadastro canônico manual, deduplicação por nome
            normalizado e vínculo ao salvar imóveis — sem alterar imóveis antigos até você
            editá-los.
          </p>
        </header>
        <AdminPendingMigrationNotice
          title="Migration pendente"
          tableName="Builder"
          description="O código de Construtoras já está pronto; falta apenas criar a tabela no banco (como você fez em Bairros)."
          sql={BUILDER_MIGRATION_SQL}
        />
      </div>
    );
  }

  const totalLinked = builders.reduce((acc, b) => acc + b.propertyCount, 0);

  return (
    <div className="pb-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Construtoras
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-300 sm:text-base">
            Visão gerencial por construtora: quantidade de imóveis vinculados, status, preço
            e acesso rápido à edição. Imóveis sem construtora não aparecem aqui — edite o
            imóvel para vincular ao salvar.
          </p>
        </header>
        <Link
          href="/admin/construtoras/novo"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
        >
          Nova construtora
        </Link>
      </div>

      {builders.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
            <span className="text-2xl font-bold text-zinc-900">{builders.length}</span>
            <span className="ml-2 text-sm text-zinc-500">
              {builders.length === 1 ? "construtora cadastrada" : "construtoras cadastradas"}
            </span>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
            <span className="text-2xl font-bold text-zinc-900">{totalLinked}</span>
            <span className="ml-2 text-sm text-zinc-500">
              {totalLinked === 1 ? "imóvel vinculado" : "imóveis vinculados"}
            </span>
          </div>
        </div>
      ) : null}

      <AdminBuildersSearch builders={builders} />
    </div>
  );
}
