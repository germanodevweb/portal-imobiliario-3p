import { notFound } from "next/navigation";

import { AdminCityForm } from "@/app/components/admin/AdminCityForm";
import { getAdminCityById } from "@/lib/admin/city-queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCidadesEditarPage({ params }: PageProps) {
  const { id } = await params;
  const city = await getAdminCityById(id);

  if (!city) notFound();

  return (
    <div className="pb-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Editar cidade
        </h1>
        <p className="mt-2 text-sm text-zinc-300 sm:text-base">
          {city.name} — {city.state}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          Slug público: /cidade/{city.slug} (não alterado ao renomear)
        </p>
      </header>

      <AdminCityForm
        mode="edit"
        initialData={{
          id: city.id,
          name: city.name,
          state: city.state,
        }}
      />
    </div>
  );
}
