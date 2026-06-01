import { redirect } from "next/navigation";

import { AdminBuilderForm } from "@/app/components/admin/AdminBuilderForm";

import { hasBuilderTable } from "@/lib/admin/schema-migration";



export default async function AdminConstrutorasNovoPage() {

  if (!(await hasBuilderTable())) {

    redirect("/admin/construtoras");

  }



  return (

    <div className="pb-12">

      <header className="mb-8">

        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">

          Nova construtora

        </h1>

        <p className="mt-2 text-sm text-zinc-300 sm:text-base">

          Cadastre a construtora antes de vincular aos imóveis de lançamento.

        </p>

      </header>



      <AdminBuilderForm mode="create" />

    </div>

  );

}

