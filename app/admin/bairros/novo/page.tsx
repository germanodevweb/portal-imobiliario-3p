import { redirect } from "next/navigation";

import { AdminNeighborhoodForm } from "@/app/components/admin/AdminNeighborhoodForm";
import { hasNeighborhoodTable } from "@/lib/admin/schema-migration";

type PageProps = {
  searchParams: Promise<{ city?: string; state?: string }>;
};

export default async function AdminBairrosNovoPage({ searchParams }: PageProps) {
  if (!(await hasNeighborhoodTable())) {
    redirect("/admin/bairros");
  }

  const sp = await searchParams;
  const prefill = {
    city: typeof sp.city === "string" ? sp.city.trim() : undefined,
    state: typeof sp.state === "string" ? sp.state.trim() : undefined,
  };

  return (
    <div className="pb-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Novo bairro
        </h1>
        <p className="mt-2 text-sm text-zinc-300 sm:text-base">
          Cadastre um bairro antes de vincular imóveis ou para padronizar nomes existentes.
        </p>
      </header>

      <AdminNeighborhoodForm mode="create" prefill={prefill} />
    </div>
  );
}
