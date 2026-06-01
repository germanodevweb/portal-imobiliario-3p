import { notFound } from "next/navigation";
import { AdminNeighborhoodForm } from "@/app/components/admin/AdminNeighborhoodForm";
import { getAdminNeighborhoodById } from "@/lib/admin/neighborhood-queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminBairrosEditarPage({ params }: PageProps) {
  const { id } = await params;
  const neighborhood = await getAdminNeighborhoodById(id);

  if (!neighborhood) notFound();

  return (
    <div className="pb-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Editar bairro
        </h1>
        <p className="mt-2 text-sm text-zinc-300 sm:text-base">
          {neighborhood.name} — {neighborhood.city}/{neighborhood.state}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          Slug público: /bairro/{neighborhood.slug} (não alterado ao renomear)
        </p>
      </header>

      <AdminNeighborhoodForm
        mode="edit"
        initialData={{
          id: neighborhood.id,
          name: neighborhood.name,
          city: neighborhood.city,
          state: neighborhood.state,
        }}
      />
    </div>
  );
}
