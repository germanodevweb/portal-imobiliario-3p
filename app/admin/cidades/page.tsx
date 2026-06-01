import Link from "next/link";

import { AdminCitiesTable } from "@/app/components/admin/AdminCitiesTable";
import { AdminPendingMigrationNotice } from "@/app/components/admin/AdminPendingMigrationNotice";
import { getAdminCities } from "@/lib/admin/city-queries";
import { CITY_MIGRATION_SQL } from "@/lib/admin/pending-migration-sql";
import { hasCityTable } from "@/lib/admin/schema-migration";

export const dynamic = "force-dynamic";

export default async function AdminCidadesPage() {
  const migrationRequired = !(await hasCityTable());
  const cities = migrationRequired ? [] : await getAdminCities();

  if (migrationRequired) {
    return (
      <div className="pb-12">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Cidades
          </h1>
        </header>
        <AdminPendingMigrationNotice
          title="Migration pendente"
          tableName="City"
          description="Cadastro canônico de cidades — execute a migration abaixo para habilitar o painel."
          sql={CITY_MIGRATION_SQL}
        />
      </div>
    );
  }

  const totalProperties = cities.reduce((acc, c) => acc + c.propertyCount, 0);

  return (
    <div className="pb-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Cidades
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-300 sm:text-base">
            Cadastre municípios canônicos. Ao editar um imóvel, se a cidade coincidir
            (mesmo com maiúsculas, acentos ou sufixo de UF), o nome e slug oficiais serão
            aplicados. Use{" "}
            <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs">
              pnpm consolidate:cities
            </code>{" "}
            para consolidar a base legada.
          </p>
        </header>
        <Link
          href="/admin/cidades/novo"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
        >
          Nova cidade
        </Link>
      </div>

      {cities.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
            <span className="text-2xl font-bold text-zinc-900">{cities.length}</span>
            <span className="ml-2 text-sm text-zinc-500">
              {cities.length === 1 ? "cidade cadastrada" : "cidades cadastradas"}
            </span>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
            <span className="text-2xl font-bold text-zinc-900">{totalProperties}</span>
            <span className="ml-2 text-sm text-zinc-500">
              imóveis vinculados (por slug)
            </span>
          </div>
        </div>
      ) : null}

      <AdminCitiesTable cities={cities} />
    </div>
  );
}
