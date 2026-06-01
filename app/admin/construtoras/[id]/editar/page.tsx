import { notFound } from "next/navigation";
import { AdminBuilderForm } from "@/app/components/admin/AdminBuilderForm";
import { getAdminBuilderById } from "@/lib/admin/builder-queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminConstrutorasEditarPage({ params }: PageProps) {
  const { id } = await params;
  const builder = await getAdminBuilderById(id);

  if (!builder) notFound();

  return (
    <div className="pb-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Editar construtora
        </h1>
        <p className="mt-2 text-sm text-zinc-300 sm:text-base">{builder.name}</p>
        <p className="mt-1 text-xs text-zinc-400">
          Slug futuro: /construtora/{builder.slug} (não alterado ao renomear)
        </p>
      </header>

      <AdminBuilderForm
        mode="edit"
        initialData={{
          id: builder.id,
          name: builder.name,
          contactName: builder.contactName,
          contactPhone: builder.contactPhone,
          contactEmail: builder.contactEmail,
        }}
      />
    </div>
  );
}
