import Link from "next/link";

import { getAdminNeighborhoodGroups } from "@/lib/admin/neighborhood-queries";

import { AdminNeighborhoodsTable } from "@/app/components/admin/AdminNeighborhoodsTable";

import { AdminPendingMigrationNotice } from "@/app/components/admin/AdminPendingMigrationNotice";

import { NEIGHBORHOOD_MIGRATION_SQL } from "@/lib/admin/pending-migration-sql";

import { hasNeighborhoodTable } from "@/lib/admin/schema-migration";



export const dynamic = "force-dynamic";



export default async function AdminBairrosPage() {

  const migrationRequired = !(await hasNeighborhoodTable());

  const groups = migrationRequired ? [] : await getAdminNeighborhoodGroups();



  const total = groups.reduce((acc, g) => acc + g.neighborhoods.length, 0);



  if (migrationRequired) {

    return (

      <div className="pb-12">

        <header className="mb-8">

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">

            Bairros

          </h1>

        </header>

        <AdminPendingMigrationNotice

          title="Migration pendente"

          tableName="Neighborhood"

          description="Cadastro canônico de bairros — execute a migration abaixo para habilitar o painel."

          sql={NEIGHBORHOOD_MIGRATION_SQL}

        />

      </div>

    );

  }



  return (

    <div className="pb-12">

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <header>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">

            Bairros

          </h1>

          <p className="mt-2 max-w-2xl text-sm text-zinc-300 sm:text-base">

            Cadastre aqui os bairros canônicos. Ao editar um imóvel, se o bairro

            coincidir (mesmo com maiúsculas ou acentos), o nome e slug oficiais serão

            aplicados. Imóveis já publicados permanecem como estão até você editá-los.

          </p>

        </header>

        <Link

          href="/admin/bairros/novo"

          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"

        >

          Novo bairro

        </Link>

      </div>



      {total > 0 ? (

        <div className="mb-6 rounded-lg border border-zinc-200 bg-white px-4 py-3">

          <span className="text-2xl font-bold text-zinc-900">{total}</span>

          <span className="ml-2 text-sm text-zinc-500">

            {total === 1 ? "bairro cadastrado" : "bairros cadastrados"}

          </span>

        </div>

      ) : null}



      <AdminNeighborhoodsTable groups={groups} />

    </div>

  );

}

