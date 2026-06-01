import { redirect } from "next/navigation";

import { AdminCityForm } from "@/app/components/admin/AdminCityForm";
import { hasCityTable } from "@/lib/admin/schema-migration";

export default async function AdminCidadesNovoPage() {
  if (!(await hasCityTable())) {
    redirect("/admin/cidades");
  }

  return (
    <div className="pb-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Nova cidade
        </h1>
        <p className="mt-2 text-sm text-zinc-300 sm:text-base">
          Cadastre um município antes de vincular imóveis ou para padronizar nomes existentes.
        </p>
      </header>

      <AdminCityForm mode="create" />
    </div>
  );
}
