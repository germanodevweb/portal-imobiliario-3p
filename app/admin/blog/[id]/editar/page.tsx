import { notFound } from "next/navigation";
import { AdminPostForm } from "@/app/components/admin/AdminPostForm";
import { getAdminPostById } from "@/lib/admin/blog-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarPostPage({ params }: Props) {
  const { id } = await params;
  
  const post = await getAdminPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Editar Artigo
        </h1>
        <p className="mt-1 text-sm text-zinc-300">
          Edite as informações do artigo selecionado.
        </p>
      </div>

      <AdminPostForm initialData={post} />
    </div>
  );
}
